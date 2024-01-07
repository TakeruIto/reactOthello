import styles from "./body.module.scss";
import Field from "./field/field"

function Body() {
  return (
    <div className="flex items-center justify-center bg-[#392467]">
      <Field></Field>
    </div>
  );
}

export default Body;