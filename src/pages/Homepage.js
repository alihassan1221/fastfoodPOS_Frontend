import React, { useState, useEffect, useMemo } from "react";
import DefaultLayout from "./../components/DefaultLayout";
import axios from "axios";
import { Row, Col, message, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import ItemList from "../components/ItemList";

const categories = [
  { name: "Burgers", imageUrl: "https://cdn-icons-png.flaticon.com/512/877/877951.png" },
  { name: "Chicken & Sides", imageUrl: "https://cdn-icons-png.flaticon.com/512/837/837555.png" },
  { name: "Drinks", imageUrl: "https://cdn-icons-png.flaticon.com/512/2405/2405479.png" },
  { name: "Shawarmas", imageUrl: "https://cdn-icons-png.flaticon.com/512/5787/5787071.png" },
  { name: "Pizzas", imageUrl: "https://cdn-icons-png.flaticon.com/512/3132/3132693.png" },
  { name: "Ice Cream", imageUrl: "https://cdn-icons-png.flaticon.com/512/3157/3157358.png" },
  { name: "Pasta", imageUrl: "https://cdn-icons-png.flaticon.com/512/3480/3480618.png" },
  { name: "Deals", imageUrl: "https://cdn-icons-png.flaticon.com/512/737/737967.png"},
  { name: "Sauces", imageUrl: "https://cdn-icons-png.flaticon.com/512/2253/2253432.png"},
];

const Homepage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Burgers");

  const dispatch = useDispatch();
  const loading = useSelector((state) => state.loading);

  useEffect(() => {
    const getAllItems = async () => {
      try {
        dispatch({ type: "SHOW_LOADING" });
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/items/get-item`
        );
        setItemsData(data);
      } catch (error) {
        message.error("Failed to load items. Please try again.");
        console.error(error);
      } finally {
        dispatch({ type: "HIDE_LOADING" });
      }
    };
    getAllItems();
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    return itemsData.filter((i) => i.category === selectedCategory);
  }, [itemsData, selectedCategory]);

  return (
    <DefaultLayout>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="categories-container" style={{ display: "flex", overflowX: "auto", padding: "10px 0", gap: "12px" }}>
            {categories.map((category) => (
              <div
                key={category.name}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCategory(category.name)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedCategory(category.name);
                  }
                }}
                className={`category-item ${selectedCategory === category.name ? "selected" : ""}`}
                aria-pressed={selectedCategory === category.name}
                style={{
                  flex: "0 0 auto",
                  textAlign: "center",
                  padding: "8px",
                  borderRadius: "10px",
                  border: selectedCategory === category.name ? "2px solid #1890ff" : "1px solid #ccc",
                  backgroundColor: selectedCategory === category.name ? "#e6f7ff" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  width: 100,
                }}
              >
                <img src={category.imageUrl} alt={category.name} style={{ width: 40, height: 40, marginBottom: 5 }} />
                <div style={{ fontSize: 13, fontWeight: 500, color: selectedCategory === category.name ? "#1890ff" : "#333" }}>
                  {category.name}
                </div>
              </div>
            ))}
          </div>

          <Row gutter={[16, 16]}>
            {filteredItems.map((item) => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <ItemList item={item} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </DefaultLayout>
  );
};

export default Homepage;
