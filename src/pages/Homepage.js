import React, { useState, useEffect, useMemo } from "react";
import DefaultLayout from "./../components/DefaultLayout";
import axios from "axios";
import { Row, Col, message, Spin, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import ItemList from "../components/ItemList";

const categories = [
  { name: "Burgers", imageUrl: "https://cdn-icons-png.flaticon.com/512/877/877951.png" },
  { name: "Pizzas", imageUrl: "https://cdn-icons-png.flaticon.com/512/3132/3132693.png" },
  { name: "Pratha Rolls and Wraps", imageUrl: "https://cdn-icons-png.flaticon.com/512/5787/5787071.png" },
  { name: "Pasta", imageUrl: "https://cdn-icons-png.flaticon.com/512/3480/3480618.png" },
  { name: "Chicken & Sides", imageUrl: "https://cdn-icons-png.flaticon.com/512/837/837555.png" },
  { name: "Ice Cream", imageUrl: "https://cdn-icons-png.flaticon.com/512/3157/3157358.png" },
  { name: "Deals", imageUrl: "https://cdn-icons-png.flaticon.com/512/737/737967.png" },
  { name: "Drinks", imageUrl: "https://cdn-icons-png.flaticon.com/512/2405/2405479.png" },
  { name: "Sauces", imageUrl: "https://cdn-icons-png.flaticon.com/512/2253/2253432.png" },
];

const Homepage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Burgers");
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = () => {
    setSearchQuery(searchText.trim().toLowerCase());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredItems = useMemo(() => {
    if (searchQuery) {
      return itemsData.filter((item) =>
        item.name.toLowerCase().includes(searchQuery)
      );
    } else {
      return itemsData.filter((item) => item.category === selectedCategory);
    }
  }, [itemsData, selectedCategory, searchQuery]);


  return (
    <DefaultLayout>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, gap: 8 }}>
            <Input
              placeholder="Search items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ maxWidth: 300 }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              Search
            </Button>
          </div>

          {/* Category Bar */}
          <div className="categories-container" style={{ display: "flex", overflowX: "auto", padding: "10px 0", gap: "12px" }}>
            {categories.map((category) => (
              <div
                key={category.name}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setSearchText("");
                  setSearchQuery("");
                }}
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

          <Row gutter={[4, 8]} style={{ margin: 0 }}>
            {filteredItems.map((item) => (
              <Col xs={12} sm={12} md={8} lg={6} key={item._id} style={{ padding: 4 }}>
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
