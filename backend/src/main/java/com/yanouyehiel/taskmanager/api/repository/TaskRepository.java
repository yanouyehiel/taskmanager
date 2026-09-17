package com.yanouyehiel.taskmanager.api.repository;

import com.yanouyehiel.taskmanager.api.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    Optional<Task> findByIdAndUser_Id(Long id, Long userId);
}
