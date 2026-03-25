package com.fabrica.lapices.repository;

import com.fabrica.lapices.model.Lapiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LapizRepository extends JpaRepository<Lapiz, Long> {
}
