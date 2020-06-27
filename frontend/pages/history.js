import PleaseSignIn from "../components/PleaseSignIn";
import OrderList from "../components/Order";
import React, { Component } from "react";
import { Query } from "react-apollo";
import { formatDistance } from "date-fns";
import Link from "next/link";
import styled from "styled-components";
import gql from "graphql-tag";
import formatMoney from "../lib/formatMoney";
import OrderItemStyles from "../components/styles/OrderItemStyles";
import Error from "../components/ErrorMessage";

const USER_ORDERS_QUERY = gql`
  query USER_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
      item {
        id
        title
        price
        description
        quantity
        image
      }
    }
  }
`;

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

class History extends Component {
  render() {
    return (
      <Query query={USER_ORDERS_QUERY}>
        {({ data: { orders }, loading, error }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <Error error={error} />;
          return (
            <div>
              <h2>Your Orders</h2>
              {/* <OrderUl> */}
              {orders.map((order) => {
                return (
                  <OrderItemStyles>
                    <Link
                      href={{
                        pathname: "/order",
                        query: { id: order.id },
                      }}
                      key={order.id}
                    >
                      <a>
                        <div className="order-meta">
                          <p>{order.item.length} items</p>
                          <p>{formatDistance(order.createdAt, new Date())}</p>
                          <p>{formatMoney(order.total)}</p>
                        </div>
                        <div className="images">
                          {order.item.map((elem) => (
                            <img
                              key={elem.id}
                              src={elem.image}
                              alt={elem.title}
                            />
                          ))}
                        </div>
                      </a>
                    </Link>
                  </OrderItemStyles>
                );
              })}
              {/* </OrderUl> */}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default History;
