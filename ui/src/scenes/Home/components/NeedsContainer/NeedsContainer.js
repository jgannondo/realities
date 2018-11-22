import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import _ from 'lodash';
import { withRouter, Redirect } from 'react-router-dom';
import { Collapse } from 'reactstrap';
import { Query } from 'react-apollo';
import { GET_NEEDS } from '@/services/queries';
import { REALITIES_DELETE_SUBSCRIPTION, REALITIES_UPDATE_SUBSCRIPTION } from '@/services/subscriptions';
import withAuth from '@/components/withAuth';
import ListHeader from '@/components/ListHeader';
import colors from '@/styles/colors';
import WrappedLoader from '@/components/WrappedLoader';
import CreateNeed from './components/CreateNeed';
import NeedsList from './components/NeedsList';

const GET_SHOW_CREATE_NEED = gql`
  query NeedsContainer_showCreateNeed {
    showCreateNeed @client
  }
`;

const NEEDS_CREATE_SUBSCRIPTION = gql`
  subscription NeedsContainer_needCreated {
    needCreated {
     title
     nodeId
    }
  }
`;

const NeedsContainer = withAuth(withRouter(({ auth, match }) => (
  <Query query={GET_SHOW_CREATE_NEED}>
    {({ data: localData, client }) => (
      <div>
        <ListHeader
          text="Needs"
          color={colors.need}
          showButton={auth.isLoggedIn}
          onButtonClick={() => client.writeData({
            data: {
              showCreateNeed: !localData.showCreateNeed,
              showCreateResponsibility: false,
            },
          })}
        />
        <Collapse isOpen={localData.showCreateNeed}>
          <CreateNeed />
        </Collapse>
        <Query query={GET_NEEDS}>
          {({
              subscribeToMore,
              loading,
              error,
              data,
            }) => {
            if (loading) return <WrappedLoader />;
            if (error) return `Error! ${error.message}`;

            const firstNeedId = data.needs && data.needs[0] && data.needs[0].nodeId;
            if (!_.find(data.needs, { nodeId: match.params.needId }) && firstNeedId) {
              return <Redirect to={`/${firstNeedId}`} />;
            }

            return (<NeedsList
              needs={data.needs}
              selectedNeedId={match.params.needId}
              subscribeToNeedsEvents={() => {
                subscribeToMore({
                  document: NEEDS_CREATE_SUBSCRIPTION,
                  updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;
                    const { needCreated } = subscriptionData.data;

                    const alreadyExists = prev.needs
                      .filter(need => need.nodeId === needCreated.nodeId)
                      .length > 0;

                    if (alreadyExists) return prev;
                    return { needs: [needCreated, ...prev.needs] };
                  },
                });
                subscribeToMore({
                  document: REALITIES_DELETE_SUBSCRIPTION,
                  updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;
                    const { realityDeleted } = subscriptionData.data;
                    return {
                      needs: prev.needs.filter((item => item.nodeId !== realityDeleted.nodeId)),
                    };
                  },
                });
                subscribeToMore({
                  document: REALITIES_UPDATE_SUBSCRIPTION,
                  updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;

                    const { realityUpdated } = subscriptionData.data;

                    return {
                      needs: prev.needs.map((item) => {
                        if (item.nodeId === realityUpdated.nodeId) return realityUpdated;
                        return item;
                      }),
                    };
                  },
                });
              }}
            />);
          }}
        </Query>
      </div>
    )}
  </Query>
)));

NeedsContainer.propTypes = {
  auth: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      needId: PropTypes.string,
    }),
  }),
};

NeedsContainer.defaultProps = {
  auth: {
    isLoggedIn: false,
  },
  match: {
    params: {
      needId: undefined,
    },
  },
};

export default NeedsContainer;
