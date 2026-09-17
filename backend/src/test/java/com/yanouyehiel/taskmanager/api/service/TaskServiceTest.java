package com.yanouyehiel.taskmanager.api.service;

import com.yanouyehiel.taskmanager.api.dto.task.TaskRequest;
import com.yanouyehiel.taskmanager.api.dto.task.TaskResponse;
import com.yanouyehiel.taskmanager.api.entity.Task;
import com.yanouyehiel.taskmanager.api.entity.TaskStatus;
import com.yanouyehiel.taskmanager.api.entity.User;
import com.yanouyehiel.taskmanager.api.exception.ResourceNotFoundException;
import com.yanouyehiel.taskmanager.api.repository.TaskRepository;
import com.yanouyehiel.taskmanager.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    private TaskService taskService;

    private User user;
    private static final String USER_EMAIL = "jean.dupont@example.com";

    @BeforeEach
    void setUp() {
        taskService = new TaskService(taskRepository, userRepository);
        user = User.builder().id(1L).fullName("Jean Dupont").email(USER_EMAIL).password("x").build();
    }

    private Task buildTask(Long id, String title, TaskStatus status) {
        return Task.builder()
                .id(id)
                .title(title)
                .description("desc " + title)
                .status(status)
                .user(user)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @SuppressWarnings("unchecked")
    private void stubFindAll(List<Task> tasks) {
        when(taskRepository.findAll(any(Specification.class))).thenReturn(tasks);
    }

    @Test
    void getTasks_shouldReturnMappedResponses_whenUserExists() {
        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        stubFindAll(List.of(buildTask(1L, "Tache 1", TaskStatus.TODO), buildTask(2L, "Tache 2", TaskStatus.DONE)));

        List<TaskResponse> result = taskService.getTasks(USER_EMAIL, null, null);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Tache 1");
        assertThat(result.get(1).getStatus()).isEqualTo(TaskStatus.DONE);
    }

    @Test
    void getTasks_shouldThrowResourceNotFoundException_whenUserDoesNotExist() {
        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTasks(USER_EMAIL, null, null))
                .isInstanceOf(ResourceNotFoundException.class);

        verifyNoInteractions(taskRepository);
    }

    @Test
    void createTask_shouldDefaultStatusToTodo_whenStatusNotProvided() {
        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task task = invocation.getArgument(0);
            task.setId(10L);
            return task;
        });

        TaskRequest request = new TaskRequest("Nouvelle tache", "description", null);

        TaskResponse response = taskService.createTask(USER_EMAIL, request);

        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getStatus()).isEqualTo(TaskStatus.TODO);

        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).save(captor.capture());
        assertThat(captor.getValue().getUser()).isEqualTo(user);
    }

    @Test
    void createTask_shouldUseProvidedStatus_whenStatusIsGiven() {
        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskRequest request = new TaskRequest("Tache en cours", "description", TaskStatus.IN_PROGRESS);

        TaskResponse response = taskService.createTask(USER_EMAIL, request);

        assertThat(response.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    void updateTask_shouldUpdateFields_whenTaskBelongsToUser() {
        Task existing = buildTask(5L, "Ancien titre", TaskStatus.TODO);

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUser_Id(5L, user.getId())).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskRequest request = new TaskRequest("Nouveau titre", "nouvelle description", TaskStatus.DONE);

        TaskResponse response = taskService.updateTask(USER_EMAIL, 5L, request);

        assertThat(response.getTitle()).isEqualTo("Nouveau titre");
        assertThat(response.getDescription()).isEqualTo("nouvelle description");
        assertThat(response.getStatus()).isEqualTo(TaskStatus.DONE);
    }

    @Test
    void updateTask_shouldKeepExistingStatus_whenStatusNotProvided() {
        Task existing = buildTask(5L, "Ancien titre", TaskStatus.IN_PROGRESS);

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUser_Id(5L, user.getId())).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskRequest request = new TaskRequest("Titre modifie", "desc modifiee", null);

        TaskResponse response = taskService.updateTask(USER_EMAIL, 5L, request);

        assertThat(response.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    void updateTask_shouldThrowResourceNotFoundException_whenTaskNotOwnedByUser() {
        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUser_Id(99L, user.getId())).thenReturn(Optional.empty());

        TaskRequest request = new TaskRequest("Titre", "desc", TaskStatus.TODO);

        assertThatThrownBy(() -> taskService.updateTask(USER_EMAIL, 99L, request))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void deleteTask_shouldDeleteTask_whenTaskBelongsToUser() {
        Task existing = buildTask(7L, "A supprimer", TaskStatus.TODO);

        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUser_Id(7L, user.getId())).thenReturn(Optional.of(existing));

        taskService.deleteTask(USER_EMAIL, 7L);

        verify(taskRepository).delete(existing);
    }

    @Test
    void deleteTask_shouldThrowResourceNotFoundException_whenTaskNotOwnedByUser() {
        when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(taskRepository.findByIdAndUser_Id(42L, user.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.deleteTask(USER_EMAIL, 42L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(taskRepository, never()).delete(any(Task.class));
    }
}
