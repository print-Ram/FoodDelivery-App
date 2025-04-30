package com.choco.home.pojo;

import com.google.cloud.firestore.annotation.DocumentId;

public class Product {

    @DocumentId
    private String product_id;
    private String name;
    private String description;
    private String imageurl;
    private int price;

    public Product() {
        // No-arg constructor needed by Firestore
    }

    public String getProduct_id() {
        return product_id;
    }

    public void setProduct_id(String product_id) {
        this.product_id = product_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageurl() {
        return imageurl;
    }

    public void setImageurl(String imageurl) {
        this.imageurl = imageurl;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }
}
