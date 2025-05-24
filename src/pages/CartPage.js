import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "../components/DefaultLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Table, Button, Modal, message, Form, Input, Select } from "antd";
import { useReactToPrint } from "react-to-print";
const CartPage = () => {
  const [subTotal, setSubTotal] = useState(0);
  const [billPopup, setBillPopup] = useState(false);
  const [popupModal, setPopupModal] = useState(false);
  const [discount, setDiscount] = useState(0); // percentage, default 0
  const [discountAmount, setDiscountAmount] = useState(0); // calculated amount

  const [billsData, setBillsData] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const componentRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.rootReducer);
  //handle increament
  const handleIncreament = (record) => {
    dispatch({
      type: "UPDATE_CART",
      payload: { ...record, quantity: record.quantity + 1 },
    });
  };
  const handleDecreament = (record) => {
    if (record.quantity !== 1) {
      dispatch({
        type: "UPDATE_CART",
        payload: { ...record, quantity: record.quantity - 1 },
      });
    }
  };
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      // Clear cart after printing
      dispatch({ type: "CLEAR_CART" });
    }
  });


  const columns = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Image",
      dataIndex: "image",
      render: (image, record) => (
        <img src={image} alt={record.name} height="60" width="60" />
      ),
    },
    { title: "Total Price", dataIndex: "totalPrice" },
    {
      title: "Quantity",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <PlusCircleOutlined
            className="mx-3"
            style={{ cursor: "pointer" }}
            onClick={() => handleIncreament(record)}
          />
          <b>{record.quantity}</b>
          <MinusCircleOutlined
            className="mx-3"
            style={{ cursor: "pointer" }}
            onClick={() => handleDecreament(record)}
          />
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <DeleteOutlined
          style={{ cursor: "pointer" }}
          onClick={() =>
            dispatch({
              type: "DELETE_FROM_CART",
              payload: record,
            })
          }
        />
      ),
    },
  ];

  useEffect(() => {
    let temp = 0;
    cartItems.forEach((item) => (temp = temp + item.price * item.quantity));
    setSubTotal(temp);
  }, [cartItems]);

  useEffect(() => {
    const discountAmt = (subTotal * discount) / 100;
    setDiscountAmount(discountAmt);
  }, [subTotal, discount]);

  const handleSubmit = async (value) => {
    try {

      const newObject = {
        ...value,
        paymentMode: "cash",
        cartItems,
        subTotal,
        tax: Number(((subTotal / 100) * 10).toFixed(2)),
        discountPercenatge: `${discount}%`,
        discountAmount: discountAmount,
        afterDiscount: subTotal - discount,
        totalAmount: Number(
          Number(subTotal)
          // Number(subTotal) + Number(((subTotal / 100) * 10).toFixed(2))
        ),
        userId: JSON.parse(localStorage.getItem("auth"))._id,
      };

      // Save bill
      await axios.post("/api/bills/add-bills", newObject);
      message.success("Bill Generated");

      // Close Create Invoice modal
      setBillPopup(false);

      // Fetch and sort bills
      const { data } = await axios.get("/api/bills/get-bills");
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setBillsData(sortedData);
      console.log('sortedData', sortedData);

      // Find latest bill for the matching customerName
      const matchedBill = sortedData.find(
        bill => bill.customerName?.trim().toLowerCase() === value.customerName?.trim().toLowerCase()
      );

      if (matchedBill) {
        setSelectedBill(matchedBill);
        setPopupModal(true);
      } else {
        message.warning("No matching bill found for the customer.");
      }

    } catch (error) {
      message.error("Something went wrong");
      console.error(error);
    }
  };



  return (
    <DefaultLayout>
      <h1>Cart Page</h1>
      <Table columns={columns} dataSource={cartItems} bordered />
      <div className="d-flex align-items-center gap-3 mb-2">
        {/* <h3>
          SUBTOTAL : Rs <b>{subTotal.toFixed(2)}</b> /-
        </h3> */}

        <div style={{ display: "flex", flexDirection: 'row' }}>
          <h3>Discount Percentage: </h3>
          <Input
            type="number"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val < 0) val = 0;
              else if (val > 100) val = 100;
              setDiscount(val);
            }}
            style={{ width: 80, marginLeft: '10px' }}
          />
        </div>

        <h3>
          Discount Amount: Rs <b>{discountAmount.toFixed(2)}</b> /-
        </h3>
      </div>

      <div className="d-flex flex-column align-items-end">
        <hr />
        <h3>
          Total : Rs  <b> {subTotal - discountAmount}</b> /-{" "}
        </h3>
        <Button type="primary" onClick={() => setBillPopup(true)}>
          Create Invoice
        </Button>
      </div>
      <Modal
        title="Create Invoice"
        visible={billPopup}
        onCancel={() => setBillPopup(false)}
        footer={false}
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="customerName" label="Customer Name">
            <Input />
          </Form.Item>
          <Form.Item name="customerNumber" label="Contact Number">
            <Input />
          </Form.Item>

          {/* <Form.Item name="paymentMode" label="Payment Method">

            <Select>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="card">Card</Select.Option>
            </Select>
          </Form.Item> */}
          <div className="bill-it">
            <h5>
              Total : <b>{subTotal - discountAmount}</b>
            </h5>

          </div>
          <div className="d-flex justify-content-end">
            <Button type="primary" htmlType="submit">
              Generate Bill
            </Button>
          </div>
        </Form>
      </Modal>

      {popupModal && (
        <Modal
          width={400}
          pagination={false}
          title="Invoice Details"
          visible={popupModal}
          onCancel={() => {
            setPopupModal(false);
            dispatch({ type: "CLEAR_CART" });
            setDiscount(0)
            setDiscountAmount(0)
          }}
          footer={false}
        >
          {/* ============ invoice modal start ==============  */}
          <div id="invoice-POS" ref={componentRef}>
            <center id="top">
              <div className="logo" />
              <div className="info">
                <h2 style={{ fontSize: "1.1em" }}>Pizza Palace And Ice Parlour</h2>
                <p> Contact : xxxxxxxxxx</p>
              </div>
              {/*End Info*/}
            </center>
            {/*End InvoiceTop*/}
            <div id="mid">
              <div className="mt-2">
                <p>
                  Customer Name : <b>{selectedBill.customerName}</b>
                  <br />
                  Phone No : <b>{selectedBill.customerNumber}</b>
                  <br />
                  Date : <b>{selectedBill.date.toString().substring(0, 10)}</b>
                  <br />
                </p>
                <hr style={{ margin: "5px" }} />
              </div>
            </div>
            {/*End Invoice Mid*/}
            <div id="bot">
              <div id="table" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <table style={{ width: "95%" }}>
                  <tbody>
                    <tr className="tabletitle">
                      <td className="item">
                        <h2>Item</h2>
                      </td>
                      <td className="Hours">
                        <h2>Qty</h2>
                      </td>
                      <td className="Rate">
                        <h2>Price</h2>
                      </td>
                      <td className="Rate">
                        <h2>Total</h2>
                      </td>
                    </tr>
                    {selectedBill.cartItems.map((item) => (
                      <>
                        <tr>
                          <td className="font-size2" style={{ border: "0.5px solid #040404", }}>{item.name}</td>
                          <td className="font-size2" style={{ border: "0.5px solid #040404", }}>{item.quantity}</td>
                          <td className="font-size2" style={{ border: "0.5px solid #040404", }}>{item.price}</td>
                          <td className="font-size2" style={{ border: "0.5px solid #040404", }}>{item.quantity * item.price}</td>
                        </tr>
                      </>
                    ))}

                    <tr className="tabletitle">
                      <td />
                      <td />
                      {/* <td className="Rate">
                        <h2>tax</h2>
                      </td>
                      <td className="payment">
                        <h2>Rs {selectedBill.tax}</h2>
                      </td> */}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style={{ textAlign: "right", margin: '5px' }}>
                <b>Total: {selectedBill.totalAmount} Rs</b>
              </p>
              {discount > 0 && <>
                <p style={{ textAlign: "right", marginBottom: '5px', marginRight: '5px' }}>
                  <strong>Discount: {discount}%</strong>
                </p>
                <p style={{ textAlign: "right", marginRight: '5px' }}>
                  <strong>After Discount: {selectedBill.totalAmount - discountAmount} Rs</strong>
                </p>
              </>}
              {/*End Table*/}
              <div id="legalcopy">
                <p className="legal" style={{ textAlign: "center" }}>
                  <strong>Thank you for your order!</strong> For any assistance, please contact us.
                </p>
              </div>
            </div>
            {/*End InvoiceBot*/}
          </div>
          {/*End Invoice*/}
          <div className="d-flex justify-content-end mt-3">
            <Button type="primary" onClick={handlePrint}>
              Print
            </Button>
          </div>
          {/* ============ invoice modal ends ==============  */}
        </Modal>
      )}
    </DefaultLayout>
  );
};

export default CartPage;
