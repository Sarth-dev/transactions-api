const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const API_URL = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

// Fetch all transactions with month filtering
app.get('/api/transactions', async (req, res) => {
    try {
        const { data } = await axios.get(API_URL);
        const { month, page = 1, perPage = 10, search = '' } = req.query;

        const searchQuery = search.toLowerCase();
        const filteredData = data.filter(transaction => {
            const saleMonth = new Date(transaction.dateOfSale).toLocaleString('default', { month: 'long' });
            const matchesMonth = saleMonth.toLowerCase() === month.toLowerCase();
            const matchesSearch = transaction.title.toLowerCase().includes(searchQuery) ||
                                  transaction.description.toLowerCase().includes(searchQuery) ||
                                  transaction.price.toString().includes(searchQuery);
            return matchesMonth && (search === '' || matchesSearch);
        });

        const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

        res.json(paginatedData);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});

// Fetch statistics for the selected month
app.get('/api/statistics', async (req, res) => {
    try {
        const { data } = await axios.get(API_URL);
        const { month } = req.query;

        const filteredData = data.filter(transaction => {
            const saleMonth = new Date(transaction.dateOfSale).toLocaleString('default', { month: 'long' });
            return saleMonth.toLowerCase() === month.toLowerCase();
        });

        const totalSales = filteredData.reduce((acc, curr) => acc + curr.price, 0);
        const totalSold = filteredData.filter(item => item.sold).length;
        const totalNotSold = filteredData.filter(item => !item.sold).length;

        res.json({ totalSales, totalSold, totalNotSold });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching statistics' });
    }
});

// Fetch bar chart data (price range) for the selected month
app.get('/api/bar-chart', async (req, res) => {
    try {
        const { data } = await axios.get(API_URL);
        const { month } = req.query;

        const filteredData = data.filter(transaction => {
            const saleMonth = new Date(transaction.dateOfSale).toLocaleString('default', { month: 'long' });
            return saleMonth.toLowerCase() === month.toLowerCase();
        });

        const priceRanges = {
            '0-100': 0,
            '101-200': 0,
            '201-300': 0,
            '301-400': 0,
            '401-500': 0,
            '501-600': 0,
            '601-700': 0,
            '701-800': 0,
            '801-900': 0,
            '901-above': 0,
        };

        filteredData.forEach(transaction => {
            if (transaction.price <= 100) priceRanges['0-100']++;
            else if (transaction.price <= 200) priceRanges['101-200']++;
            else if (transaction.price <= 300) priceRanges['201-300']++;
            else if (transaction.price <= 400) priceRanges['301-400']++;
            else if (transaction.price <= 500) priceRanges['401-500']++;
            else if (transaction.price <= 600) priceRanges['501-600']++;
            else if (transaction.price <= 700) priceRanges['601-700']++;
            else if (transaction.price <= 800) priceRanges['701-800']++;
            else if (transaction.price <= 900) priceRanges['801-900']++;
            else priceRanges['901-above']++;
        });

        res.json(priceRanges);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching bar chart data' });
    }
});

// Fetch pie chart data (category distribution) for the selected month
app.get('/api/pie-chart', async (req, res) => {
    try {
        const { data } = await axios.get(API_URL);
        const { month } = req.query;

        const filteredData = data.filter(transaction => {
            const saleMonth = new Date(transaction.dateOfSale).toLocaleString('default', { month: 'long' });
            return saleMonth.toLowerCase() === month.toLowerCase();
        });

        const categories = {};
        filteredData.forEach(transaction => {
            categories[transaction.category] = (categories[transaction.category] || 0) + 1;
        });

        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching pie chart data' });
    }
});

app.listen(5000, () => console.log('Server is running on port 5000'));
