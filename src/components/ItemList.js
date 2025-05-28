import React from "react";
import { Button, Card } from "antd";
import { useDispatch } from "react-redux";

const ItemList = ({ item }) => {
  const dispatch = useDispatch();

  const handleAddTOCart = () => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...item, quantity: 1 },
    });
  };

  return (
    <Card
      hoverable
      style={{
        width: "100%",
        borderRadius: 10,
        padding: 0,
        marginBottom: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ display: "flex" }}>
        {/* Left - Image */}
        <div style={{ width: 100, height: 100 }}>
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "10px 0 0 10px",
            }}
          />
        </div>

        {/* Right - Content */}
        <div
          style={{
            flex: 1,
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 600,
                color: "#333",
              }}
            >
              {item.name}
            </h4>
            <p
              style={{
                margin: "8px 0 12px",
                fontWeight: "bold",
                color: "#ff4d4f",
                fontSize: "13px",
              }}
            >
              Rs {item.price}
            </p>
          </div>

          <Button
            type="primary"
            size="small"
            block
            onClick={handleAddTOCart}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ItemList;
