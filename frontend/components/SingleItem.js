import React, { Component } from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Error from "./ErrorMessage";
import styled from "styled-components";
import Head from "next/head";

const SingleItemStyles = styled.div`
  max-width: 50rem;
  margin: 2rem auto;
  box-shadow: ${(props) => props.theme.bs};
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 8rem;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`;

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      largeImage
    }
  }
`;

export class SingleItem extends Component {
  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ error, loading, data }) => {
          if (error) return <Error error={error} />;
          if (loading) return <p>Loading...</p>;
          if (!data.item) return <p>No item found</p>;
          return (
            <SingleItemStyles>
              <Head>
                <title>Uniqlone | {data.item.title}</title>
              </Head>
              <img src={data.item.largeImage} alt={data.item.title} />
              <div className="details">
                <h2>{data.item.title}</h2>

                <p>{data.item.description}</p>
              </div>
            </SingleItemStyles>
          );
        }}
      </Query>
    );
  }
}

export default SingleItem;
