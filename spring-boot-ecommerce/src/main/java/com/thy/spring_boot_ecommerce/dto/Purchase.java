package com.thy.spring_boot_ecommerce.dto;

import com.thy.spring_boot_ecommerce.entitiy.Address;
import com.thy.spring_boot_ecommerce.entitiy.Customer;
import com.thy.spring_boot_ecommerce.entitiy.Order;
import com.thy.spring_boot_ecommerce.entitiy.OrderItem;
import lombok.Data;

import java.util.Set;


@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
}
