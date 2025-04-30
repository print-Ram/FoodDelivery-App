package com.choco.home.controller;

import com.choco.home.pojo.Product;
import com.choco.home.service.FirestoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private FirestoreService firestoreService;

    @GetMapping
    public List<Product> getAllProducts() {
        try {
            return firestoreService.getAllProducts();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable String id) {
        try {
            return firestoreService.getProductById(id);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    @GetMapping("/search/{name}")
    public List<Product> getProductsByName(@PathVariable String name) {
        try {
            return firestoreService.getProductsByName(name);
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    @PostMapping
    public String addProduct(@RequestBody Product product) {
        try {
            return firestoreService.addProduct(product);
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to add product";
        }
    }

    @PutMapping("/{id}")
    public String updateProduct(@PathVariable String id, @RequestBody Product product) {
        try {
            return firestoreService.updateProduct(id, product);
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to update product";
        }
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable String id) {
        try {
            return firestoreService.deleteProduct(id);
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to delete product";
        }
    }
}
