package com.thy.spring_boot_ecommerce.service;

import com.thy.spring_boot_ecommerce.dto.Purchase;
import com.thy.spring_boot_ecommerce.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
}
