export default function Toast({message,type,visible}){

return(

<div
className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded text-white
${visible ? "opacity-100" : "opacity-0"}
${type==="error" ? "bg-red-500" : "bg-green-600"}`}
>

{message}

</div>

)

}