import React from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import progress from './progress-1.jpg';
import './style.scss';

import SelectSkills from './select-skills';
import { Button, ModalCard } from 'components/ui';
import { Modal } from 'components/util';
import {
  GUIDE_LOAD,
  FEATURED,
  GUIDE_ATTACH_SKILL,
  GUIDE_REMOVE_SKILL,
  GUIDE_TO_RUBRIC,
  GUIDE_CREATE,
  ASYNC_START,
  ASYNC_END,
  GUIDE_TO_FINISH,
  GUIDE_REQUEST_AUTH,
  MODAL_OPEN,
  MODAL_CLOSE,
  LOGIN,
  REGISTER
} from 'reducer/action-types';
import { admin } from 'fetch';

const createGuideThunk = model => dispatch => {
  dispatch({
    type: GUIDE_CREATE,
    subtype: ASYNC_START
  });
  admin.createGuide(model).then(res => {
    return Promise.resolve(res.data);
  }).catch(err => {
    return Promise.resolve(err.response.data);
  }).then(payload => {
    dispatch({
      type: GUIDE_CREATE,
      subtype: ASYNC_END,
      payload
    });
  });
};

const loadFeaturedThunk = () => dispatch => {
  admin.getFeaturedSkills().then(res => {
    return Promise.resolve(res.data);
  }).catch(err => {
    return Promise.resolve(err.response.data);
  }).then(payload => dispatch({
    type: GUIDE_LOAD,
    subtype: FEATURED,
    payload
  }));
};

const mapStateToProps = state => ({
  model: state.guide.model,
  role: state.guide.model.role,
  skills: state.guide.model.skills,
  featuredSkills: state.guide.meta.featuredSkills,
  loadedSkills: state.guide.meta.loadedSkills,
  meta: state.guide.meta,
  isAuthed: state.auth.user
});

const mapDispatchToProps = dispatch => ({
  loadFeatured: () => dispatch(loadFeaturedThunk()),
  onAddSkill: skill => dispatch({
    type: GUIDE_ATTACH_SKILL,
    payload: skill
  }),
  onRemoveSkill: skill => dispatch({
    type: GUIDE_REMOVE_SKILL,
    payload: skill
  }),
  onContinue: () => dispatch({ type: GUIDE_TO_RUBRIC }),
  requestAuth: () => dispatch({
    type: GUIDE_REQUEST_AUTH,
    subtype: MODAL_OPEN
  }),
  closeRequestAuth: () => dispatch({
    type: GUIDE_REQUEST_AUTH,
    subtype: MODAL_CLOSE
  }),
  onLogin: () => dispatch({
    type: GUIDE_REQUEST_AUTH,
    subtype: LOGIN
  }),
  onRegister: () => dispatch({
    type: GUIDE_REQUEST_AUTH,
    subtype: REGISTER
  }),
  onFinish: () => dispatch({
    type: GUIDE_TO_FINISH
  }),
  createGuide: model => dispatch(createGuideThunk(model))
});

const AuthModal = props => (
  <Modal>
    <ModalCard>
      <div className='guide-request-auth'>
        <div className='header bold'>
          You must sign in to skip
        </div>
        <div className='ctas'>
          <Button flex label='Log in' onClick={props.onLogin} />
          <Button flex label='Register' onClick={props.onRegister} />
          <a onClick={props.onClose}>cancel</a>
        </div>
      </div>
    </ModalCard>
  </Modal>
);

const WaitModal = props => (
  <Modal>
    <ModalCard>
      {
        props.creatingGuide === 'request' ? (
          <div className='guide-wait-creation'>
            <div className='bold'>
              Creating your guide
            </div>
            Please wait a moment...
          </div>
        ) : (
          <div className='guide-wait-creation'>
            <div className='bold'>
              Your guide has been created
            </div>
            <Button flex label='ok' onClick={props.onFinish} />
          </div>
        ) 
      }
    </ModalCard>
  </Modal>
);

class CGAddSkills extends React.PureComponent {
  componentWillMount() {
    this.props.loadFeatured();
  }

  render() {
    const { role, skills, meta, featuredSkills, loadedSkills } = this.props;
    const { activeModal, creatingGuide } = meta;
    if (meta.redirect) {
      meta.redirect = null;
      return <Redirect to='/guides' />
    }
    if (!role) {
      return <Redirect to='/' />
    }
    return (
      <div className='cg-add-skills'>
        { activeModal ? <AuthModal 
            onClose={this.props.closeRequestAuth} 
            onLogin={this.props.onLogin}
            onRegister={this.props.onRegister}
          /> : null }
        { creatingGuide ? <WaitModal creatingGuide={creatingGuide} onFinish={this.props.onFinish} /> : null }
        <div className='cg-description'>
          <div className='progress'>
            <img src={progress} />
          </div>
          <div className='main'>
            Select What to Assess
          </div>
          <div className='sub'>
            Research shows that interviewers are more effective when they assess skills and qualities deemed most critical for success in the role. Choose up to 8.
          </div>
        </div>
        <div className='cg-workspace'>
          <div className='cgws'>
            <div className='cgws-role'>
              Role: <span className='name'>{role.name}</span>
            </div>
            <div className='cgws-main'>
              <SelectSkills 
                skills={skills} 
                featuredSkills={featuredSkills} 
                loaded={loadedSkills} 
                onAdd={this.props.onAddSkill}
                onRemove={this.props.onRemoveSkill}
              />
            </div>
            <div className='cgws-nav rel'>
              <div className='cgws-nav__left'>
                <Link to='/'>&#8249; Back</Link>
              </div>
              <div className='cgws-nav__right'>
                <Button label='Continue' onClick={this.continue} />
                <a to='/create-guide/define-rubric' onClick={this.skip}>Skip</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  continue = () => {
    this.props.onContinue();
    this.props.history.push('/create-guide/define-rubric');
  }

  skip = () => {
    if (!this.props.isAuthed) {
      this.props.requestAuth();
    } else {
      const model = {
        role: this.props.model.role,
        skills: this.props.model.skills.map(skill => skill.name),
        questions: this.props.model.questions.map(question => ({
          text: question.text,
          rubric: question.rubric.map(item => ({
            points: item.points,
            desc: item.desc
          }))
        })),
        duration: this.props.model.duration
      }
      this.props.createGuide(model);
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CGAddSkills));
