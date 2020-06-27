import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";
import styled from "styled-components";
import PropTypes from "prop-types";

const REMOVE_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  float: right;
  font-size: 3rem;
  background: none;
  border: 0;

  cursor: pointer;
  &:hover {
    color: ${(props) => props.theme.red};
  }
`;

class Remove extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  //Called once mutation has been performed
  update = (cache, payload) => {
    //Read cache
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    //Remove item from cart
    const cartItemId = payload.data.removeFromCart.id;
    data.me.cart = data.me.cart.filter((item) => {
      return item.id !== cartItemId;
    });
    //write back to cache
    cache.writeQuery({
      query: CURRENT_USER_QUERY,
      data,
    });
  };
  render() {
    return (
      <>
        <Mutation
          update={this.update}
          mutation={REMOVE_MUTATION}
          variables={{ id: this.props.id }}
          optimisticResponse={{
            __typename: "Mutation",
            removeFromCart: {
              __typename: "CartItem",
              id: this.props.id,
            },
          }}
        >
          {(remove, { loading, error }) => {
            return (
              <BigButton
                disabled={loading}
                onClick={() => remove().catch((err) => alert(err.message))}
                title="Delete Item"
              >
                &times;
              </BigButton>
            );
          }}
        </Mutation>
      </>
    );
  }
}

export default Remove;
