import React from 'react'
import { connect } from 'react-redux'
import Nav from '../../components/Nav/nav'

const PageContainer = (props) => (
  <div className="container">
    <div className="row align-items-center page-container">
      <div className="col align-self-center page-container-border">
        <div className="jumbotron">
          <h1 className="display-4" data-testid="app-header-text">Time Tracking Application</h1>
          <p className="lead" data-testid="app-description" >
            This is a simple application to allow freelancers to track their
            time.
          </p>
          <hr className="my-4" />
          <div className="row">
            <div className="col-3">
              <Nav location={props.location} />
            </div>
            <div className="col-9">{props.children}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const mapStateToProps = (state) => {
  return {
    location: state.router.location,
  }
}

export default connect(mapStateToProps)(PageContainer)
