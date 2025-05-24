import React, { useEffect, useState, useRef } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useDispatch } from "react-redux";
import { EyeOutlined } from "@ant-design/icons";
import ReactToPrint from "react-to-print";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import { Modal, Button, Table } from "antd";
import "../styles/InvoiceStyles.css";
const BillsPage = () => {
  const componentRef = useRef();
  const dispatch = useDispatch();
  const [billsData, setBillsData] = useState([]);
  const [popupModal, setPopupModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const getAllBills = async () => {
    try {
      dispatch({
        type: "SHOW_LOADING",
      });
      const { data } = await axios.get("/api/bills/get-bills");

      // Sort by date in descending order (newest first)
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setBillsData(sortedData);
      dispatch({ type: "HIDE_LOADING" });
      console.log(sortedData);
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      console.log(error);
    }
  };

  //useEffect
  useEffect(() => {
    getAllBills();
    //eslint-disable-next-line
  }, []);
  //print function
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  //able data
  const columns = [
    { title: "ID ", dataIndex: "_id" },
    {
      title: "Cutomer Name",
      dataIndex: "customerName",
    },
    { title: "Contact No", dataIndex: "customerNumber" },
    { title: "Discount Percentage", dataIndex: "discountPercenatge" },
    { title: "Discounted Amount", dataIndex: "discountAmount" },
    { title: "Total Amount", dataIndex: "totalAmount" },
    { title: "After Discount", dataIndex: "afterDiscount" },
    // { title: "Subtotal", dataIndex: "subTotal" },
    // { title: "Tax", dataIndex: "tax" },

    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <EyeOutlined
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedBill(record);
              setPopupModal(true);
            }}
          />
        </div>
      ),
    },
  ];
  return (
    <DefaultLayout>
      <div className="d-flex justify-content-between">
        <h1>Invoice list</h1>
      </div>

      <Table columns={columns} dataSource={billsData} bordered />

      {popupModal && (
        <Modal
          width={400}
          pagination={false}
          title="Invoice Details"
          visible={popupModal}
          onCancel={() => {
            setPopupModal(false);
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
                          <td className="font-size2" style={{ border: "0.1px solid #040404", }}>{item.name}</td>
                          <td className="font-size2" style={{ border: "0.1px solid #040404", }}>{item.quantity}</td>
                          <td className="font-size2" style={{ border: "0.1px solid #040404", }}>{item.price}</td>
                          <td className="font-size2" style={{ border: "0.1px solid #040404", }}>{item.quantity * item.price}</td>
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
              <p style={{ textAlign: "right", marginBottom: '5px', marginRight: "5px" }}>
                <strong>Discount: {selectedBill.discountPercenatge}</strong>
              </p>
              <p style={{ textAlign: "right", marginRight: "5px" }}>
                <strong>After Discount: {selectedBill.afterDiscount} Rs</strong>
              </p>
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

export default BillsPage;
