package com.choco.home.service;

import com.choco.home.pojo.Product;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class FirestoreService {

    @Autowired
    private Firestore firestore;

    private static final String COLLECTION_NAME = "products";

    public List<Product> getAllProducts() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Product> products = new ArrayList<>();

        for (QueryDocumentSnapshot doc : documents) {
            Product product = doc.toObject(Product.class);
            product.setProduct_id(doc.getId()); // Set the document ID if needed
            products.add(product);
        }

        return products;
    }
    
    public List<Product> getProductsByName(String name) throws ExecutionException, InterruptedException {
        CollectionReference products = firestore.collection(COLLECTION_NAME);
        Query query = products.whereEqualTo("name", name);
        ApiFuture<QuerySnapshot> querySnapshot = query.get();

        List<Product> matchedProducts = new ArrayList<>();
        for (QueryDocumentSnapshot doc : querySnapshot.get().getDocuments()) {
            Product product = doc.toObject(Product.class);
            product.setProduct_id(doc.getId());
            matchedProducts.add(product);
        }

        return matchedProducts;
    }


    public Product getProductById(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot doc = docRef.get().get();
        if (doc.exists()) {
            Product product = doc.toObject(Product.class);
            if (product != null) product.setProduct_id(doc.getId());
            return product;
        } else {
            return null;
        }
    }

    public String addProduct(Product product) throws ExecutionException, InterruptedException {
        DocumentReference docRef;
        if (product.getProduct_id() != null && !product.getProduct_id().isEmpty()) {
            docRef = firestore.collection(COLLECTION_NAME).document(product.getProduct_id());
        } else {
            docRef = firestore.collection(COLLECTION_NAME).document(); // Auto ID
            product.setProduct_id(docRef.getId());
        }
        ApiFuture<WriteResult> result = docRef.set(product);
        result.get(); // wait for write to complete
        return product.getProduct_id();
    }

    public String updateProduct(String id, Product product) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        product.setProduct_id(id);
        ApiFuture<WriteResult> future = docRef.set(product);
        future.get(); // wait for update to complete
        return "Product with ID " + id + " updated.";
    }

    public String deleteProduct(String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(id);
        ApiFuture<WriteResult> future = docRef.delete();
        future.get(); // wait for delete to complete
        return "Product with ID " + id + " deleted.";
    }
}
