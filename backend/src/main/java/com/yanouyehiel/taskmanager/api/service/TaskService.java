package com.yanouyehiel.taskmanager.api.service;

import com.yanouyehiel.taskmanager.api.dto.task.TaskRequest;
import com.yanouyehiel.taskmanager.api.dto.task.TaskResponse;
import com.yanouyehiel.taskmanager.api.entity.Task;
import com.yanouyehiel.taskmanager.api.entity.TaskStatus;
import com.yanouyehiel.taskmanager.api.entity.User;
import com.yanouyehiel.taskmanager.api.exception.ResourceNotFoundException;
import com.yanouyehiel.taskmanager.api.repository.TaskRepository;
import com.yanouyehiel.taskmanager.api.repository.UserRepository;
import com.yanouyehiel.taskmanager.api.service.spec.TaskSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public List<TaskResponse> getTasks(String userEmail, TaskStatus status, String search) {
        User user = getUserByEmail(userEmail);

        List<TaskResponse> tasks = taskRepository.findAll(TaskSpecifications.build(user.getId(), status, search))
                .stream()
                .map(TaskResponse::fromEntity)
                .toList();

        log.debug("Utilisateur={} a récupéré {} tâche(s) (status={}, search={})",
                userEmail, tasks.size(), status, search);
        return tasks;
    }

    public TaskResponse createTask(String userEmail, TaskRequest request) {
        User user = getUserByEmail(userEmail);

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .user(user)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Tâche créée id={} par utilisateur={}", saved.getId(), userEmail);

        return TaskResponse.fromEntity(saved);
    }

    public TaskResponse updateTask(String userEmail, Long taskId, TaskRequest request) {
        User user = getUserByEmail(userEmail);
        Task task = getOwnedTask(taskId, user.getId());

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        Task saved = taskRepository.save(task);
        log.info("Tâche id={} mise à jour par utilisateur={}", saved.getId(), userEmail);

        return TaskResponse.fromEntity(saved);
    }

    public void deleteTask(String userEmail, Long taskId) {
        User user = getUserByEmail(userEmail);
        Task task = getOwnedTask(taskId, user.getId());
        taskRepository.delete(task);
        log.info("Tâche id={} supprimée par utilisateur={}", taskId, userEmail);
    }

    private Task getOwnedTask(Long taskId, Long userId) {
        return taskRepository.findByIdAndUser_Id(taskId, userId)
                .orElseThrow(() -> {
                    log.warn("Tâche id={} introuvable ou non possédée par userId={}", taskId, userId);
                    return new ResourceNotFoundException("Tâche introuvable avec l'id : " + taskId);
                });
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'email : " + email));
    }
}
