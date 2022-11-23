import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink, } from '@apollo/client'

import { setContext } from '@apollo/client/link/context';



const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          patients: {
            merge(existing, incoming) {
              return incoming;
            }
          },
          vaccinationCertificates: {
            merge(existing, incoming) {
              return incoming;
            }
          },
        }
      }
    }
  });

const httpLink = createHttpLink({
  uri: 'http://localhost:5000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: cache,
  });

export {
    apolloClient
}
