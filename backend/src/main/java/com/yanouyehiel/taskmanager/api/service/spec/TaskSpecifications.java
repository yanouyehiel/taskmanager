package com.yanouyehiel.taskmanager.api.service.spec;

import com.yanouyehiel.taskmanager.api.entity.Task;
import com.yanouyehiel.taskmanager.api.entity.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    public static Specification<Task> belongsToUser(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Task> hasStatus(TaskStatus status) {
        if (status == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Task> matchesSearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String like = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), like),
                cb.like(cb.lower(root.get("description")), like)
        );
    }

    public static Specification<Task> build(Long userId, TaskStatus status, String search) {
        Specification<Task> spec = belongsToUser(userId);
        Specification<Task> statusSpec = hasStatus(status);
        Specification<Task> searchSpec = matchesSearch(search);
        if (statusSpec != null) {
            spec = spec.and(statusSpec);
        }
        if (searchSpec != null) {
            spec = spec.and(searchSpec);
        }
        return spec;
    }
}
