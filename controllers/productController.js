
const pool = require("../config/database");

// GET: Menampilkan semua produk
const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id::text AS id,
                sku,
                name,
                description,
                price::text AS price,
                stock,
                created_at,
                updated_at
            FROM products
            ORDER BY id DESC
        `);

        res.status(200).json({
            success: true,
            total: result.rowCount,
            data: result.rows
        });

    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve products"
        });
    }
};


// GET: Menampilkan produk berdasarkan ID
const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const result = await pool.query(`
            SELECT
                id::text AS id,
                sku,
                name,
                description,
                price::text AS price,
                stock,
                created_at,
                updated_at
            FROM products
            WHERE id = $1
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Get product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve product"
        });
    }
};


// POST: Menambahkan produk baru
const createProduct = async (req, res) => {
    const { sku, name, description, price, stock } = req.body;

    if (
        typeof sku !== "string" || !sku.trim() ||
        typeof name !== "string" || !name.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "SKU and product name are required"
        });
    }

    if (
        !/^\d+$/.test(String(price)) ||
        !Number.isSafeInteger(Number(price)) ||
        Number(price) < 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Price must be a valid non-negative integer"
        });
    }

    if (
        !Number.isSafeInteger(stock) ||
        stock < 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Stock must be a non-negative integer"
        });
    }

    if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Description must be a string or null"
        });
    }

    try {
        const result = await pool.query(`
            INSERT INTO products (
                sku,
                name,
                description,
                price,
                stock,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING
                id::text AS id,
                sku,
                name,
                description,
                price::text AS price,
                stock,
                created_at,
                updated_at
        `, [
            sku.trim(),
            name.trim(),
            description ?? null,
            String(price),
            stock
        ]);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Create product error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "SKU already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create product"
        });
    }
};


// PUT: Mengubah produk
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { sku, name, description, price, stock } = req.body;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    if (
        typeof sku !== "string" || !sku.trim() ||
        typeof name !== "string" || !name.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "SKU and product name are required"
        });
    }

    if (
        !/^\d+$/.test(String(price)) ||
        !Number.isSafeInteger(Number(price)) ||
        Number(price) < 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Price must be a valid non-negative integer"
        });
    }

    if (!Number.isSafeInteger(stock) || stock < 0) {
        return res.status(400).json({
            success: false,
            message: "Stock must be a non-negative integer"
        });
    }

    if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Description must be a string or null"
        });
    }

    try {
        const result = await pool.query(`
            UPDATE products
            SET
                sku = $1,
                name = $2,
                description = $3,
                price = $4,
                stock = $5,
                updated_at = NOW()
            WHERE id = $6
            RETURNING
                id::text AS id,
                sku,
                name,
                description,
                price::text AS price,
                stock,
                created_at,
                updated_at
        `, [
            sku.trim(),
            name.trim(),
            description ?? null,
            String(price),
            stock,
            id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Update product error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "SKU already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
};


// DELETE: Menghapus produk
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }

    try {
        const result = await pool.query(`
            DELETE FROM products
            WHERE id = $1
            RETURNING id::text AS id
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete product"
        });
    }
};


module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
