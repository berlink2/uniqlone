import React, { Component } from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import CartStyles from "./styles/CartStyles";
import Supreme from "./styles/Supreme";
import CloseButton from "./styles/CloseButton";
import SickButton from "./styles/SickButton";
import User from "./User";
import CartItem from "./CartItem";
import calcTotalPrice from "../lib/calcTotalPrice";
import formatMoney from "../lib/formatMoney";
import { adopt } from "react-adopt";
import Payment from "./Payment";

export const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

export const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => (
    <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>
  ),
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
});

const Cart = () => (
  <>
    <Composed>
      {({ user, toggleCart, localState }) => {
        const me = user.data.me;
        if (!me) return null;

        return (
          <CartStyles open={localState.data.cartOpen}>
            <header>
              <CloseButton onClick={toggleCart} title="close">
                &times;
              </CloseButton>
              <Supreme>My Cart</Supreme>
              <p>
                You have {me.cart.length} item
                {me.cart.length === 1 ? "" : "s"} in your cart
              </p>
            </header>
            <ul>
              {me.cart.map((item, i) => {
                return <CartItem cartItem={item} key={i} />;
              })}
            </ul>
            <footer>
              <p> Total: {formatMoney(calcTotalPrice(me.cart))}</p>

              {me.cart.length && (
                <Payment>
                  {" "}
                  <SickButton>Checkout</SickButton>
                </Payment>
              )}
            </footer>
          </CartStyles>
        );
      }}
    </Composed>
  </>
);
export default Cart;
