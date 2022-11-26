import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink, } from '@apollo/client'
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:5000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

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

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: cache,
});

export {
  apolloClient
}
