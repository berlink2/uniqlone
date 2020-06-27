import UpdateItem from "../components/UpdateItem";

const update = (props) => {
  return (
    <div>
      <UpdateItem id={props.query.id} />
    </div>
  );
};

export default update;
