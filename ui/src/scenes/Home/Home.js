import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Card,
} from 'reactstrap';
import styled from 'styled-components';
import withAuth from '@/components/withAuth';
import colors from '@/styles/colors';
import NeedsContainer from './components/NeedsContainer';
import ResponsibilitiesContainer from './components/ResponsibilitiesContainer';
import DetailViewContainer from './components/DetailViewContainer';

const RealitiesListHeader = styled(Card)`
  font-size: 1.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  flex-direction: row;
  justify-content: space-between;
  color: white;
  background-color: #999;
  margin-bottom: 0.5rem;
`;

const NeedsListHeader = RealitiesListHeader.extend`
  background-color: ${colors.need};
`;

const ResponsibilitiesListHeader = RealitiesListHeader.extend`
  background-color: ${colors.responsibility};
`;

const Home = withAuth(({ auth }) => (
  <Container fluid>
    <Row>
      <Col lg={3} xs={12}>
        <NeedsListHeader>
          <span>Needs</span>
          { auth.isLoggedIn &&
            'New need'
          }
        </NeedsListHeader>
        <NeedsContainer />
      </Col>
      <Col lg={3} xs={12}>
        <ResponsibilitiesListHeader>
          <span>Responsibilities</span>
          { auth.isLoggedIn &&
            'New Resp'
          }
        </ResponsibilitiesListHeader>
        <ResponsibilitiesContainer />
      </Col>
      <Col lg={6} xs={12}>
        <DetailViewContainer />
      </Col>
    </Row>
  </Container>
));

Home.propTypes = {
  auth: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
  }),
};

Home.defaultProps = {
  auth: {
    isLoggedIn: false,
  },
};

export default Home;
