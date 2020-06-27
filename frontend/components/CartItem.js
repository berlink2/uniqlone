import formatMoney from "../lib/formatMoney";
import styled from "styled-components";
import React from "react";
import PropTypes from "prop-types";

import Remove from "./Remove";
const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${(props) => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 1rem;
  }
  h3,
  p {
    margin: 0;
  }
`;

const CartItem = ({ cartItem }) => {
  //check if item exists
  if (!cartItem.item)
    return (
      <CartItemStyles>
        <p>This Item has been removed.</p>
        <Remove id={cartItem.id} />
      </CartItemStyles>
    );
  return (
    <CartItemStyles>
      <img src={cartItem.item.image} width="100" alt={cartItem.item.title} />
      <div className="cart-item-details">
        <h3>{cartItem.item.title}</h3>
        <p>
          <em>
            {cartItem.quantity} &times; {formatMoney(cartItem.item.price)}
          </em>
        </p>
        <p>
          Total Item Price:{" "}
          {formatMoney(cartItem.item.price * cartItem.quantity)}
        </p>
      </div>
      <Remove id={cartItem.id} />
    </CartItemStyles>
  );
};

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired,
};

export default CartItem;
