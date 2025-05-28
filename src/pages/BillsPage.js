import React, { useEffect, useState, useRef } from "react";
import { Table, Modal, Button, message, Popconfirm } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useReactToPrint } from "react-to-print";
import DefaultLayout from "../components/DefaultLayout";
import "../styles/InvoiceStyles.css";

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const isYesterday = (bill, now = new Date()) =>
  isSameDay(bill, new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

const isSameWeek = (d1, d2) => {
  const start = new Date(d2);
  const day = d2.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return d1 >= start && d1 < end;
};

const isLastWeek = (bill, now = new Date()) => {
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() + diff);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  return bill >= lastWeekStart && bill < thisWeekStart;
};

const isSameMonth = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();

const isLastMonth = (bill, now = new Date()) => {
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return (
    bill.getFullYear() === lastMonth.getFullYear() &&
    bill.getMonth() === lastMonth.getMonth()
  );
};

const StatsBox = ({ label, value }) => (
  <div
    style={{
      display: "inline-block",
      minWidth: 130,
      margin: 8,
      padding: "12px 16px",
      background: "#fafafa",
      border: "1px solid #d9d9d9",
      borderRadius: 6,
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 600 }}>{value.toFixed(0)} Rs</div>
  </div>
);

const BillsPage = () => {
  const dispatch = useDispatch();
  const componentRef = useRef();

  const [billsData, setBillsData] = useState([]);
  const [popupModal, setPopupModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [totals, setTotals] = useState({
    today: 0,
    yesterday: 0,
    week: 0,
    lastWeek: 0,
    month: 0,
    lastMonth: 0,
  });

  // Fetch all bills excluding deleted ones
  const getAllBills = async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/bills/get-bills`
      );

      // Filter out deleted bills (assuming deleted flag exists)
      const filteredData = data.filter((bill) => !bill.deleted);

      // newest first
      const sorted = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setBillsData(sorted);
      dispatch({ type: "HIDE_LOADING" });

      // Calculate totals
      const now = new Date();
      const t = { today: 0, yesterday: 0, week: 0, lastWeek: 0, month: 0, lastMonth: 0 };
      sorted.forEach((bill) => {
        const d = new Date(bill.date);
        const amt = Number(bill.afterDiscount) || 0;
        if (isSameDay(d, now)) t.today += amt;
        if (isYesterday(d, now)) t.yesterday += amt;
        if (isSameWeek(d, now)) t.week += amt;
        if (isLastWeek(d, now)) t.lastWeek += amt;
        if (isSameMonth(d, now)) t.month += amt;
        if (isLastMonth(d, now)) t.lastMonth += amt;
      });
      setTotals(t);
    } catch (err) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Could not load bills");
      console.error(err);
    }
  };

  useEffect(() => {
    getAllBills();
    // eslint-disable-next-line
  }, []);

  // Soft delete handler
  const handleDelete = async (id) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/bills/delete-bill/${id}`, {
        isDeleted: true, // or whatever your API expects
      });
      message.success("Bill deleted successfully");
      setPopupModal(false);
      getAllBills();
      dispatch({ type: "HIDE_LOADING" });
    } catch (err) {
      dispatch({ type: "HIDE_LOADING" });
      message.error("Failed to delete bill");
      console.error(err);
    }
  };

  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  const columns = [
    { title: "ID", dataIndex: "_id" },
    { title: "Customer Name", dataIndex: "customerName" },
    { title: "Contact No", dataIndex: "customerNumber" },
    { title: "Discount Percentage", dataIndex: "discountPercenatge" },
    { title: "Discounted Amount", dataIndex: "discountAmount" },
    { title: "Total Amount", dataIndex: "totalAmount" },
    { title: "After Discount", dataIndex: "afterDiscount" },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <EyeOutlined
            style={{ cursor: "pointer", fontSize: 18 }}
            onClick={() => {
              setSelectedBill(record);
              setPopupModal(true);
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this bill?"
            onConfirm={() => handleDelete(id)}
            okText="Yes"
            cancelText="No"
            icon={false}
          >
            <DeleteOutlined style={{ color: "red", cursor: "pointer", fontSize: 18 }} />
          </Popconfirm>
        </div>

      ),
    },
  ];

  return (
    <DefaultLayout>
      <h1>Invoice list</h1>

      <div style={{ marginBottom: 24 }}>
        <StatsBox label="Today" value={totals.today} />
        <StatsBox label="Yesterday" value={totals.yesterday} />
        <StatsBox label="This Week" value={totals.week} />
        <StatsBox label="Last Week" value={totals.lastWeek} />
        <StatsBox label="This Month" value={totals.month} />
        <StatsBox label="Last Month" value={totals.lastMonth} />
      </div>

      <Table columns={columns} dataSource={billsData} bordered rowKey="_id" />

      {popupModal && selectedBill && (
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
          <div id="invoice-POS" ref={componentRef}>
            <center id="top">
              <div>
                <img
                  src={require("../assets/logo.png")}
                  alt="Logo"
                  style={{ width: "50px", height: "50px" }}
                />
              </div>
              <div className="info">
                <h2 style={{ fontSize: "1.1em" }}>Pizza Palace And Ice Parlour</h2>
                <p> Contact : 03004200967 | 03099027713</p>
              </div>
            </center>

            <div id="mid" className="mt-2">
              <p>
                {/* Customer Name : <b>{selectedBill.customerName}</b>
                <br />
                Phone No : <b>{selectedBill.customerNumber}</b>
                <br /> */}
                Date :{" "}
                <b>
                  {new Date(selectedBill.date).toLocaleDateString("en-CA", {
                    timeZone: "Asia/Karachi",
                  })}
                </b>
              </p>
              <hr style={{ margin: 5 }} />
            </div>

            <div id="bot">
              <div
                id="table"
                style={{ width: "100%", display: "flex", justifyContent: "center" }}
              >
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
                      <tr key={item._id}>
                        <td style={{ border: "0.1px solid #040404" }}>{item.name}</td>
                        <td style={{ border: "0.1px solid #040404" }}>{item.quantity}</td>
                        <td style={{ border: "0.1px solid #040404" }}>{item.price}</td>
                        <td style={{ border: "0.1px solid #040404" }}>
                          {item.quantity * item.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ textAlign: "right", margin: 5 }}>
                <b>Total: {selectedBill.totalAmount} Rs</b>
              </p>
              <p style={{ textAlign: "right", margin: 5 }}>
                <b>Discount: {selectedBill.discountPercenatge}</b>
              </p>
              <p style={{ textAlign: "right", margin: 5 }}>
                <b>After Discount: {selectedBill.afterDiscount} Rs</b>
              </p>

              <div id="legalcopy">
                <p className="legal" style={{ textAlign: "center" }}>
                  <strong>Thank you for your order!</strong> For any assistance, please contact us.
                </p>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <Button type="primary" onClick={handlePrint}>
              Print
            </Button>
          </div>
        </Modal>
      )}
    </DefaultLayout>
  );
};

export default BillsPage;
