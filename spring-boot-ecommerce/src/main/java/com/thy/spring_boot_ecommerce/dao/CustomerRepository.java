package com.thy.spring_boot_ecommerce.dao;

import com.thy.spring_boot_ecommerce.entitiy.Customer;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Customer findByEmail(String theEmail);
}
