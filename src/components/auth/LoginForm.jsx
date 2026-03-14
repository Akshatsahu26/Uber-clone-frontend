import { useState } from "react"
import { useNavigate } from "react-router-dom"
import InputField from "../ui/InputField"
import { axiosInstance } from "../../config/axiosinstance"


export default function LoginForm(){
	const navigate = useNavigate()

	const [form,setForm]=useState({
		email:"",
		password:""
	})

async function handleLogin(){

try{

const res = await axiosInstance.post("/auth/login",form)

			// save token and user then navigate to home
			const token = res?.data?.data?.token
			const user = res?.data?.data?.user

			if (token) {
				localStorage.setItem("uber_token", token)
			}
			if (user) {
				localStorage.setItem("uber_user", JSON.stringify(user))
			}

			alert("Login Success")
			navigate('/home')

}catch(err){

alert(err.response?.data?.message)

}

}

return(

<div className="flex flex-col gap-4">

<h2 className="text-3xl font-bold">
Log in
</h2>

<InputField
label="Email"
value={form.email}
onChange={(e)=>setForm({...form,email:e.target.value})}
/>

<InputField
label="Password"
type="password"
value={form.password}
onChange={(e)=>setForm({...form,password:e.target.value})}
/>

<button
onClick={handleLogin}
className="bg-black text-white p-3 rounded-lg"
>

Login

</button>

</div>

)

}