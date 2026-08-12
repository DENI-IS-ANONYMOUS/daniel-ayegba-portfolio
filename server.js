require("dotenv").config();
const express=require("express"),path=require("path"),nodemailer=require("nodemailer");
const fs=require("fs");
const app=express(),PORT=Number(process.env.PORT||8080),PUBLIC=path.join(__dirname,"public"),REVIEWS_FILE=path.join(__dirname,"reviews.json");
function readReviews(){try{return JSON.parse(fs.readFileSync(REVIEWS_FILE,"utf8"));}catch{return [];}}
function writeReviews(items){fs.writeFileSync(REVIEWS_FILE,JSON.stringify(items.slice(-50),null,2));}
app.disable("x-powered-by");
app.use(express.json({limit:"50kb"}));
app.use(express.static(PUBLIC));
const clean=(v,n)=>String(v??"").replace(/[<>]/g,"").trim().slice(0,n);
app.get("/api/health",(req,res)=>res.json({ok:true,emailConfigured:Boolean(process.env.EMAIL_USER&&process.env.EMAIL_APP_PASSWORD)}));
app.get("/api/reviews",(req,res)=>res.json({ok:true,reviews:readReviews().reverse()}));
app.post("/api/reviews",async(req,res)=>{
 const name=clean(req.body.name,80),email=clean(req.body.email,160),message=clean(req.body.message,1200),rating=Number(req.body.rating);
 if(!name||!email||!message||!Number.isInteger(rating)||rating<1||rating>5)return res.status(400).json({ok:false,message:"Please complete all fields and choose a 1–5 star rating."});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({ok:false,message:"Please enter a valid email address."});
 if(!process.env.EMAIL_USER||!process.env.EMAIL_APP_PASSWORD)return res.status(503).json({ok:false,message:"The site works, but email is not configured. Add your Gmail App Password to .env."});
 try{
  const transporter=nodemailer.createTransport({service:"gmail",auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_APP_PASSWORD}});
  await transporter.sendMail({from:`"Daniel Ayegba Portfolio" <${process.env.EMAIL_USER}>`,to:process.env.REVIEW_TO||"danieljoseph8449@gmail.com",replyTo:email,subject:`Portfolio review — ${rating}/5 from ${name}`,text:`Name: ${name}\nEmail: ${email}\nRating: ${rating}/5\n\n${message}`});
  const reviews=readReviews();
  reviews.push({name,rating,message,date:new Date().toISOString()});
  writeReviews(reviews);
  res.json({ok:true,message:"Review sent successfully. It is now displayed below."});
 }catch(e){console.error(e.message);res.status(500).json({ok:false,message:"Review could not be sent. Check the Gmail App Password in .env."});}
});
app.use((req,res)=>res.sendFile(path.join(PUBLIC,"index.html")));
app.listen(PORT,"0.0.0.0",()=>console.log(`Daniel Ayegba Portfolio running at http://127.0.0.1:${PORT}`));
