const { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLID, GraphQLString, GraphQLNonNull, GraphQLEnumType, responsePathAsArray } = require('graphql');

const PatientType = new GraphQLObjectType({
    name: 'Patient',
    fields: () => ({
        id: { type: GraphQLID },
        did: { type: GraphQLString },
        email: { type: GraphQLString },
        name: { type: GraphQLString },
        zzzs_num: { type: GraphQLString },
    })
});