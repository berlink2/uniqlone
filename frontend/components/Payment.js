import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import Router from "next/router";
import NProgress from "nprogress";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import calcTotalPrice from "../lib/calcTotalPrice";
import Error from "./ErrorMessage";
import User, { CURRENT_USER_QUERY } from "./User";

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      item {
        id
        title
      }
    }
  }
`;

function totalItems(cart) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

class Payment extends React.Component {
  onToken = async (res, createOrder) => {
    NProgress.start();
    const order = await createOrder({
      variables: {
        token: res.id,
      },
    }).catch((err) => {
      alert(err.message);
    });

    Router.push({
      pathname: "/order",
      query: {
        id: order.data.createOrder.id,
      },
    });
  };

  render() {
    return (
      <User>
        {({ data: { me } }) => {
          return (
            <Mutation
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
              {(createOrder, { error }) => (
                <>
                  {/* <Error error={error} /> */}
                  <StripeCheckout
                    amount={calcTotalPrice(me.cart)}
                    name="Uniqlone"
                    description={`Order of ${totalItems(me.cart)} items`}
                    stripeKey="pk_test_RxlrJLRbNOZJ4z9Ui5YlqQ6S00TcgFn2ny"
                    currency="USD"
                    //email={me.email}
                    token={(res) => this.onToken(res, createOrder)}
                  >
                    <p>{this.props.children}</p>
                  </StripeCheckout>
                </>
              )}
            </Mutation>
          );
        }}
      </User>
    );
  }
}

export default Payment;
