import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { ALL_ITEMS_QUERY } from "../components/Items";
const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

export class DeleteItem extends Component {
  update = (cache, payload) => {
    //Get all items
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    //Filter out deleted item
    data.items = data.items.filter(
      (item) => item.id !== payload.data.deleteItem.id
    );
    //put items back into cache
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
  };
  render() {
    return (
      <Mutation
        update={this.update}
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
      >
        {(deleteItem, { error }) => (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this item?")) {
                deleteItem();
              }
            }}
          >
            {this.props.children}
          </button>
        )}
      </Mutation>
    );
  }
}

export default DeleteItem;
