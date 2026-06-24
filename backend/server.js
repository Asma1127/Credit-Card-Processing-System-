const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const app = express()

app.use(cors())
app.use(express.json())

/* ==========================
MongoDB Connection
========================== */

mongoose.connect(
"mongodb+srv://projectUser:projectPass123@cluster0.a2f4yhp.mongodb.net/creditcard?retryWrites=true&w=majority&appName=Cluster0"
)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

/* ==========================
Models
========================== */

const User = mongoose.model("User",{
name:String,
email:String,
password:String,
role:String
})

const Card = mongoose.model("Card",{
userId:String,
cardNumber:String,
cardType:String,
expiryDate:String,
cvv:String,
balance:{type:Number,default:5000},
status:String
})

const Transaction = mongoose.model("Transaction",{
userId:String,
merchantId:String,
merchantName:String,
cardId:String,
amount:Number,
status:String,
createdAt:{type:Date,default:Date.now}
})


/* ==========================
Auth Middleware
========================== */

const authMiddleware = (req,res,next)=>{

const token = req.headers.authorization?.split(" ")[1]

if(!token) return res.status(401).json({message:"No token"})

try{

const decoded = jwt.verify(token,"SECRETKEY")
req.user = decoded
next()

}catch(err){

res.status(403).json({message:"Invalid token"})

}

}

/* ==========================
Test Route
========================== */

app.get("/",(req,res)=>{
res.send("Credit Card Processing API Running")
})

/* ==========================
Register
========================== */

app.post("/api/register",async(req,res)=>{

try{

const {name,email,password,role} = req.body

const existingUser = await User.findOne({email})

if(existingUser){
return res.status(400).json({message:"User already exists"})
}

const hashedPassword = await bcrypt.hash(password,10)

const user = new User({
name,
email,
password:hashedPassword,
role
})

await user.save()

const token = jwt.sign(
{ id:user._id, role:user.role },
"SECRETKEY",
{ expiresIn:"1d" }
)

res.json({
token,
role:user.role,
name:user.name,
email:user.email
})

}catch(err){

res.status(500).json(err)

}

})

/* ==========================
Login
========================== */

app.post("/api/login",async(req,res)=>{

try{

const {email,password} = req.body

const user = await User.findOne({email})

if(!user) return res.status(404).json({message:"User not found"})

const valid = await bcrypt.compare(password,user.password)

if(!valid) return res.status(401).json({message:"Invalid password"})

const token = jwt.sign(
{ id:user._id, role:user.role },
"SECRETKEY",
{ expiresIn:"1d" }
)

res.json({
token,
role:user.role,
name:user.name,
email:user.email
})

}catch(err){

res.status(500).json(err)

}

})

/* ==========================
Add Card
========================== */

app.post("/api/cards",authMiddleware,async(req,res)=>{

try{

const card = new Card({
userId:req.user.id,
cardNumber:req.body.cardNumber,
cardType:req.body.cardType,
expiryDate:req.body.expiryDate,
cvv:req.body.cvv,
balance:5000,
status:"active"
})

await card.save()

res.json({
message:"Card added successfully",
card
})

}catch(err){

res.status(500).json(err)

}

})

/* ==========================
Get Cards
========================== */

app.get("/api/cards",authMiddleware,async(req,res)=>{

try{

const cards = await Card.find({userId:req.user.id})

res.json(cards)

}catch(err){

res.status(500).json(err)

}

})

/* ==========================
Remove Card
========================== */

app.delete("/api/cards/:id",authMiddleware,async(req,res)=>{

try{

const card = await Card.findOneAndDelete({
_id:req.params.id,
userId:req.user.id
})

if(!card){
return res.status(404).json({message:"Card not found"})
}

res.json({message:"Card removed successfully"})

}catch(err){

res.status(500).json(err)

}

})

/* ==========================
Make Payment
========================== */

app.post("/api/pay",authMiddleware,async(req,res)=>{

try{

const {merchantId,merchantName,cardId,amount} = req.body

const card = await Card.findById(cardId)

if(!card){
return res.status(404).json({message:"Card not found"})
}

let status = "success"

/* Fraud Check */

if(amount > 10000){
status = "failed"
}

/* Balance Check */

if(card.balance < amount){
status = "failed"
}

/* Deduct Balance */

if(status === "success"){
card.balance -= amount
await card.save()
}

/* Save Transaction */

const transaction = new Transaction({
userId:req.user.id,
merchantId,
merchantName,
cardId,
amount,
status
})

await transaction.save()

res.json({
message: status === "success" ? "Payment successful" : "Transaction failed",
transaction
})

}catch(err){

res.status(500).json(err)

}

})

/* ==========================
User Transactions
========================== */

app.get("/api/transactions",authMiddleware,async(req,res)=>{

try{

const transactions = await Transaction.find({
userId:req.user.id
}).sort({createdAt:-1})

res.json(transactions)

}catch(err){

res.status(500).json(err)

}

})

/* ==========================
Admin Stats
========================== */

app.get("/api/admin/stats",authMiddleware,async(req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Access denied"})
}

/* exclude admin */

const totalUsers = await User.countDocuments({role:{$ne:"admin"}})

const totalTransactions = await Transaction.countDocuments()

const volumeResult = await Transaction.aggregate([
{ $match:{status:"success"} },
{
$group:{
_id:null,
totalVolume:{ $sum:"$amount" }
}
}
])

const totalVolume = volumeResult.length > 0 ? volumeResult[0].totalVolume : 0

const fraudAlerts = await Transaction.countDocuments({
status:"failed",
amount:{ $gt:10000 }
})

res.json({
totalUsers,
totalTransactions,
totalVolume,
fraudAlerts
})

}catch(err){

res.status(500).json(err)

}

})
/* ==========================
Admin - All Transactions
========================== */

app.get("/api/admin/transactions", authMiddleware, async (req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Access denied"})
}

const transactions = await Transaction.find().sort({createdAt:-1})

const result = []

for(const t of transactions){

let userName = "Unknown"
let cardLast4 = "----"
let merchant = t.merchantId || "Unknown"

/* check valid userId */

if(mongoose.Types.ObjectId.isValid(t.userId)){
const user = await User.findById(t.userId)
if(user) userName = user.name
}

/* check valid cardId */

if(mongoose.Types.ObjectId.isValid(t.cardId)){
const card = await Card.findById(t.cardId)
if(card && card.cardNumber){
cardLast4 = card.cardNumber.slice(-4)
}
}

result.push({
_id:t._id,
userName:userName,
merchant:merchant,
cardLast4:cardLast4,
amount:t.amount,
status:t.status,
createdAt:t.createdAt
})

}

res.json(result)

}catch(err){

console.log("ADMIN TRANSACTION ERROR:",err)

res.status(500).json({
message:"Error loading transactions"
})

}

})


/* ==========================
Admin Fraud Alerts
========================== */

app.get("/api/admin/fraud-alerts",authMiddleware,async(req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Access denied"})
}

const frauds = await Transaction.find({
status:"failed",
amount:{$gt:10000}
}).sort({createdAt:-1})

const result = []

for(const f of frauds){

let userName = "Unknown"
let cardLast4 = "----"
let merchant = f.merchantId || "Unknown"

/* Get user */

if(mongoose.Types.ObjectId.isValid(f.userId)){
const user = await User.findById(f.userId)
if(user) userName = user.name
}

/* Get card */

if(mongoose.Types.ObjectId.isValid(f.cardId)){
const card = await Card.findById(f.cardId)
if(card && card.cardNumber){
cardLast4 = card.cardNumber.slice(-4)
}
}

result.push({
userName:userName,
merchant:merchant,
cardLast4:cardLast4,
amount:f.amount,
date:f.createdAt
})

}

res.json(result)

}catch(err){

console.log("FRAUD ALERT ERROR:",err)

res.status(500).json({
message:"Error loading fraud alerts"
})

}

})


/* ==========================
Admin Users (Exclude Admin)
========================== */

app.get("/api/admin/users",authMiddleware,async(req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Access denied"})
}

const users = await User.find({
role:{$ne:"admin"}
}).select("name email role")

res.json(users)

}catch(err){

res.status(500).json(err)

}

})
/* ==========================
Admin - Suspicious Users
========================== */

app.get("/api/admin/suspicious-users", authMiddleware, async (req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Access denied"})
}

/* find failed transactions */

const frauds = await Transaction.aggregate([
{
$match:{status:"failed"}
},
{
$group:{
_id:"$userId",
failedCount:{ $sum:1 },
totalAmount:{ $sum:"$amount" }
}
},
{
$match:{
failedCount:{ $gte:3 }
}
}
])

const result = []

for(const f of frauds){

let name="Unknown"
let email=""

if(mongoose.Types.ObjectId.isValid(f._id)){
const user = await User.findById(f._id)

if(user){
name = user.name
email = user.email
}
}

result.push({
userId:f._id,
name:name,
email:email,
failedTransactions:f.failedCount,
amountAttempted:f.totalAmount
})

}

res.json(result)

}catch(err){

console.log(err)
res.status(500).json({message:"Error loading suspicious users"})

}

})
/* ==========================
Admin Analytics
========================== */

app.get("/api/admin/analytics", authMiddleware, async (req,res)=>{

try{

if(req.user.role !== "admin"){
return res.status(403).json({message:"Access denied"})
}

/* Merchant Usage */

const merchantAgg = await Transaction.aggregate([
{
$group:{
_id:"$merchantId",
count:{ $sum:1 }
}
}
])

const merchantUsage = {}

merchantAgg.forEach(m=>{
merchantUsage[m._id || "Unknown"] = m.count
})

/* Transaction Status */

const success = await Transaction.countDocuments({
status:"success"
})

const failed = await Transaction.countDocuments({
status:"failed"
})

res.json({
merchantUsage,
transactionStatus:{
success,
failed
}
})

}catch(err){

console.log(err)
res.status(500).json({message:"Analytics error"})

}

})
/* ==========================
Merchant
========================== */

app.get("/api/merchant-transactions", authMiddleware, async (req,res)=>{

const merchant = await User.findById(req.user.id);

const transactions = await Transaction.find({
merchantName: merchant.name
}).sort({createdAt:-1});

res.json(transactions);

});

/* ==========================
Server
========================== */

const PORT = 5000

app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`)
})
