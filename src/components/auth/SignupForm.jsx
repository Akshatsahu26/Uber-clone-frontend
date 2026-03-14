import { useState } from "react"
import InputField from "../ui/InputField"
import { axiosInstance } from "../../config/axiosinstance"
import { useNavigate } from "react-router-dom"


export default function SignupForm(){
  const navigate = useNavigate()

const [form,setForm]=useState({
name:"",
email:"",
phone:"",
password:""
})

async function handleSignup(){

try{

const res = await axiosInstance.post("/auth/signup",form)

localStorage.setItem("uber_token",res.data.data.token)

alert("Signup Success")
navigate('/home')

}catch(err){

alert(err.response?.data?.message)

}

}

return(

<div className="flex flex-col gap-4">

<h2 className="text-3xl font-bold">
Create account
</h2>

<InputField
label="Name"
value={form.name}
onChange={(e)=>setForm({...form,name:e.target.value})}
/>

<InputField
label="Email"
value={form.email}
onChange={(e)=>setForm({...form,email:e.target.value})}
/>

<InputField
label="Phone"
value={form.phone}
onChange={(e)=>setForm({...form,phone:e.target.value})}
/>

<InputField
label="Password"
type="password"
value={form.password}
onChange={(e)=>setForm({...form,password:e.target.value})}
/>

<button
onClick={handleSignup}
className="bg-black text-white p-3 rounded-lg"
>

Create Account

</button>

</div>

)

}