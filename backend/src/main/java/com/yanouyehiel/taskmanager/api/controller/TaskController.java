package com.yanouyehiel.taskmanager.api.controller;

import com.yanouyehiel.taskmanager.api.dto.task.TaskRequest;
import com.yanouyehiel.taskmanager.api.dto.task.TaskResponse;
import com.yanouyehiel.taskmanager.api.entity.TaskStatus;
import com.yanouyehiel.taskmanager.api.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tâches", description = "Gestion CRUD des tâches de l'utilisateur connecté")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "Lister les tâches", description = "Retourne les tâches de l'utilisateur connecté, avec filtrage optionnel par statut et recherche texte.")
    public ResponseEntity<List<TaskResponse>> getTasks(
            @AuthenticationPrincipal UserDetails principal,
            @Parameter(description = "Filtrer par statut") @RequestParam(required = false) TaskStatus status,
            @Parameter(description = "Recherche dans le titre ou la description") @RequestParam(required = false) String search) {
        return ResponseEntity.ok(taskService.getTasks(principal.getUsername(), status, search));
    }

    @PostMapping
    @Operation(summary = "Créer une tâche")
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(principal.getUsername(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une tâche existante")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(principal.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une tâche")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        taskService.deleteTask(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
