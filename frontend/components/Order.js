import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { format } from "date-fns";
import Head from "next/head";
import gql from "graphql-tag";
import formatMoney from "../lib/formatMoney";
import OrderStyles from "../components/styles/OrderStyles";

const SINGLE_ORDER_QUERY = gql`
  query SINGLE_ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      charge
      total
      createdAt
      user {
        id
      }
      item {
        id
        title
        description
        price
        image
        quantity
      }
    }
  }
`;
class Order extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  render() {
    return (
      <Query query={SINGLE_ORDER_QUERY} variables={{ id: this.props.id }}>
        {({ data, error, loading }) => {
          if (error) return <Error error={error} />;
          if (loading) return <p>Loading...</p>;
          const order = data.order;
          return (
            <OrderStyles>
              <Head>
                <title> Uniqlone | Order {order.id}</title>
              </Head>
              <p>
                <span>Order ID:</span>
                <span>{this.props.id}</span>
              </p>
              <p>
                <span>Charge</span>
                <span>{order.charge}</span>
              </p>
              <p>
                <span>Date</span>
                <span>
                  {format(order.createdAt, "MMMM d, YYYY h:mm a", {
                    awareOfUnicodeTokens: true,
                  })}
                </span>
              </p>
              <p>
                <span>Order Total</span>

                <span>{formatMoney(order.total)}</span>
              </p>
              <p>
                <span>Total Items</span>

                <span>{order.item.length}</span>
              </p>
              <div className="items">
                {order.item.map((elem) => {
                  return (
                    <div key={elem.id} className="order-item">
                      <img src={elem.image} alt={elem.title} />
                      <div className="item-details">
                        <h2>{elem.title}</h2>
                        <p>Quantity: {elem.quantity}</p>
                        <p>Price: {formatMoney(elem.price)}</p>
                        <p>
                          Subtotal: {formatMoney(elem.quantity * elem.price)}
                        </p>
                        <p>{elem.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </OrderStyles>
          );
        }}
      </Query>
    );
  }
}
export default Order;
