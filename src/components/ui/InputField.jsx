export default function InputField({
  label,
  type="text",
  value,
  onChange,
  placeholder,
  error
}){

return(

<div className="flex flex-col gap-1">

<label className="text-sm text-gray-500">
{label}
</label>

<input
type={type}
value={value}
onChange={onChange}
placeholder={placeholder}
className="border p-3 rounded-lg"
/>

{error && (
<p className="text-red-500 text-xs">
{error}
</p>
)}

</div>

)

};