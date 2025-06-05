import React, { useEffect, useState } from "react";
import {
    Table,
    Input,
    Card,
    Button,
    message,
    Spin,
    Alert,
    DatePicker,
} from "antd";
import {
    DownloadOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DefaultLayout from "../components/DefaultLayout";
import moment from "moment-timezone";

const { RangePicker } = DatePicker;

const SalesReportPage = () => {
    const [salesData, setSalesData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [detailedData, setDetailedData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState(null);

    // Fetch default sales summary on mount
    const fetchSalesSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/reports/item-sales-summary`
            );
            setSalesData(res.data);
            setFilteredData(res.data);
        } catch (error) {
            setError("Failed to load sales data.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesSummary();
    }, []);

    // Search by item name in summary table
    const handleSearch = (value) => {
        setSearchText(value);
        const filtered = salesData.filter((item) =>
            item.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    // Handle date range filtering: fetch detailed data and update summary filteredData
    const handleDateRangeChange = async (dates) => {
        setDateRange(dates);
        if (!dates) {
            setFilteredData(salesData);
            setDetailedData([]);
            return;
        }

        const startDate = moment(dates[0]).tz("Asia/Karachi").startOf("day").format();
        const endDate = moment(dates[1]).tz("Asia/Karachi").endOf("day").format();

        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/reports/item-sales-by-date`,
                {
                    params: {
                        start: startDate,
                        end: endDate,
                    },
                    headers: {
                        "Cache-Control": "no-cache",
                    },
                }
            );

            // Store detailed data for exporting
            setDetailedData(res.data);

            // Update filtered summary data for table display
            const filtered = salesData.map((item) => {
                // sum quantities for this item in detailed data
                const totalQuantity = res.data
                    .filter((d) => d.item === item.name)
                    .reduce((sum, d) => sum + d.quantity, 0);

                return {
                    ...item,
                    today: totalQuantity,
                    yesterday: 0,
                    thisWeek: 0,
                    lastWeek: 0,
                    thisMonth: 0,
                    lastMonth: 0,
                    total: totalQuantity,
                };
            });

            setFilteredData(filtered);
        } catch (error) {
            message.error("Failed to filter data by date.");
            console.error("Date filter error:", error.response || error.message || error);
        }
    };

    // Export filtered or detailed data to Excel
    const exportToExcel = () => {
        if (dateRange && detailedData.length) {
            // Export detailed data with columns Item, Date, Quantity
            const detailedForExport = detailedData.map((record) => ({
                Item: record.item,
                Date: record.date,
                Quantity: record.quantity,
            }));

            const worksheet = XLSX.utils.json_to_sheet(detailedForExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Detail");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, "sales_detail_report.xlsx");
        } else if (filteredData.length) {
            // Export summary filtered data as is
            const worksheet = XLSX.utils.json_to_sheet(filteredData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Summary");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, "sales_report.xlsx");
        } else {
            message.warning("No data to export!");
        }
    };

    const columns = [
        {
            title: "Item",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        { title: "Today", dataIndex: "today", sorter: (a, b) => a.today - b.today },
        {
            title: "Yesterday",
            dataIndex: "yesterday",
            sorter: (a, b) => a.yesterday - b.yesterday,
        },
        {
            title: "This Week",
            dataIndex: "thisWeek",
            sorter: (a, b) => a.thisWeek - b.thisWeek,
        },
        {
            title: "Last Week",
            dataIndex: "lastWeek",
            sorter: (a, b) => a.lastWeek - b.lastWeek,
        },
        {
            title: "This Month",
            dataIndex: "thisMonth",
            sorter: (a, b) => a.thisMonth - b.thisMonth,
        },
        {
            title: "Last Month",
            dataIndex: "lastMonth",
            sorter: (a, b) => a.lastMonth - b.lastMonth,
        },
        {
            title: "Total Sold",
            dataIndex: "total",
            sorter: (a, b) => a.total - b.total,
            render: (total) => (
                <strong style={{ color: total > 50 ? "green" : "inherit" }}>
                    {total}
                </strong>
            ),
        },
    ];

    return (
        <DefaultLayout>
            <Card
                title="📦 Sales Report"
                extra={
                    <div style={{ display: "flex", gap: 8 }}>
                        <Input
                            placeholder="Search Item"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ width: 200 }}
                            allowClear
                        />
                        <RangePicker onChange={handleDateRangeChange} />
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={exportToExcel}
                            disabled={!filteredData.length && !detailedData.length}
                        >
                            Export
                        </Button>
                    </div>
                }
                style={{ marginTop: 20 }}
            >
                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
                {loading ? (
                    <Spin size="large" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="name"
                        bordered
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: "max-content", y: 500 }}
                    />
                )}
            </Card>
        </DefaultLayout>
    );
};

export default SalesReportPage;
