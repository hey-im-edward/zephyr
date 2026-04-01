package com.webbanpc.shoestore.adminrole;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRoleRepository extends JpaRepository<AdminRole, Long> {

    List<AdminRole> findAllByOrderByNameAsc();
}
