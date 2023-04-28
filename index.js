import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Razorpay from 'razorpay'
import crypto from 'crypto'



const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.get("/api/getkey", (req, res) => {
    try {
        return res.status(200).json({ key: process.env.RAZORPAY_KEY_ID })

    } catch (error) {
        res.status(400).json({ msg: error.msg })
    }
})
//razorpay
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
app.post("/api/checkout", async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100),
            currency: "INR",
        };
        const order = await instance.orders.create(options);
        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(400).json({ msg: error.msg })
    }
})


app.post("/api/paymentverification", (req, res) => {
    
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
          res.redirect(
                `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
            );
        } else {
            res.status(400).json({
                success: false,
            });
    }
    
})
const PORT = process.env.PORT_NO

app.listen(PORT, () => {
    console.log(`server is running at port no: ${PORT}`);
})