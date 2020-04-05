import React, { useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { useGlobalState, useGlobalMutation } from '../utils/container'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import useRouter from '../utils/use-router'
import useStream from '../utils/use-stream'
import RTCClient from '../rtc-client'
import StreamPlayer from './meeting/stream-player'
import { useParams } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const useStyles = makeStyles({
  menu: {
    height: '150px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '10'
  },
  customBtn: {
    width: '50px',
    height: '50px',
    borderRadius: '26px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backgroundSize: '50px',
    cursor: 'pointer'
  },
  leftAlign: {
    display: 'flex',
    flex: '1',
    justifyContent: 'space-evenly'
  },
  rightAlign: {
    display: 'flex',
    flex: '1',
    justifyContent: 'center'
  },
  menuContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end'
  }
})

const calcGridArea = (index) => {
  let c = 1
  let r = 1
  if (index != 0) {
    if (index < 6) {
      r = index % 3 + 1
      if (index > 2 && index < 6) {
        c = 2
      }
    } else {
      c = index < 11 ? 3 : 4
      r = index < 11 ? index % 6 + 1 : index % 10
    }
  }
  const gridArea = `${c} / ${r}`
  return gridArea
}

const MeetingPage = () => {
  const classes = useStyles()

  const routerCtx = useRouter()
  const stateCtx = useGlobalState()

  const mutationCtx = useGlobalMutation()

  const localClient = useMemo(() => {
    const client = new RTCClient()
    if (!client._created) {
      client.createClient({ codec: stateCtx.codec, mode: stateCtx.mode })
      client._created = true
    }
    return client
  }, [stateCtx.codec, stateCtx.mode])

  const [localStream, currentStream] = useStream(localClient)

  const { name: channelName, role } = useParams()

  const config = useMemo(() => {
    return {
      token: null,
      channel: channelName,
      microphoneId: stateCtx.config.microphoneId,
      cameraId: stateCtx.config.cameraId,
      resolution: stateCtx.config.resolution,
      muteVideo: stateCtx.muteVideo,
      muteAudio: stateCtx.muteAudio,
      uid: 0,
      host: role === 'host'
    }
  }, [stateCtx])

  const history = routerCtx.history

  useEffect(() => {
    if (!config.channel) {
      history.push('/')
    }
  }, [config.channel, history])

  useEffect(() => {
    return () => {
      localClient && localClient.leave()
        .then(() => mutationCtx.clearAllStream())
    }
  }, [localClient])

  useEffect(() => {
    if (channelName && localClient._created && localClient._joined === false) {
      mutationCtx.startLoading()
      localClient.join(config).then(() => {
        if (config.host) {
          localClient.setClientRole('host').then(() => {
            localClient.publish()
            mutationCtx.stopLoading()
          }, (err) => {
            mutationCtx.toastError(`setClientRole Failure: ${err.info}`)
          })
        } else {
          localClient.setClientRole('audience').then(() => {
            mutationCtx.stopLoading()
          }, (err) => {
            mutationCtx.toastError(`setClientRole Failure: ${err.info}`)
          })
        }
      }).catch((err) => {
        mutationCtx.toastError(`Media ${err.info}`)
        routerCtx.history.push('/')
      })
    }
  }, [localClient, mutationCtx, config, channelName, routerCtx])

  const handleClick = (name) => {
    return (evt) => {
      evt.stopPropagation()
      switch (name) {
        case 'video': {
          stateCtx.muteVideo ? localStream.muteVideo() : localStream.unmuteVideo()
          mutationCtx.setVideo(!stateCtx.muteVideo)
          break
        }
        case 'audio': {
          stateCtx.muteAudio ? localStream.muteAudio() : localStream.unmuteAudio()
          mutationCtx.setAudio(!stateCtx.muteAudio)
          break
        }
        default:
          throw new Error(`Unknown click handler, name: ${name}`)
      }
    }
  }

  const handleDoubleClick = (stream) => {
    mutationCtx.setCurrentStream(stream)
  }

  const [otherStreams, placeholders] = useMemo(() => {
    const _otherStreams = stateCtx.streams.filter(it => it.getId() !== currentStream.getId())
    const _placeholders = Array.from(new Array(16), () => null)
    return [_otherStreams, _placeholders]
  }, [currentStream, stateCtx])

  return !stateCtx.loading ? (<div className="meeting">
    <div className="current-view">
      <div className="nav">
        <div></div>
        <div className="quit" onClick={() => {
          localClient.leave().then(() => {
            mutationCtx.clearAllStream()
            routerCtx.history.push('/')
          })
        }}></div>
      </div>
      {currentStream ? <div className={classes.menuContainer}>
        {config.host && <div className={classes.menu}>
          <Tooltip title={stateCtx.muteVideo ? 'mute-video' : 'unmute-video'}>
            <i onClick={handleClick('video')} className={clsx(classes.customBtn, 'margin-right-19', stateCtx.muteVideo ? 'mute-video' : 'unmute-video')}/>
          </Tooltip>
          <Tooltip title={stateCtx.muteAudio ? 'mute-audio' : 'unmute-audio'}>
            <i onClick={handleClick('audio')} className={clsx(classes.customBtn, 'margin-right-19', stateCtx.muteAudio ? 'mute-audio' : 'unmute-audio')}/>
          </Tooltip>
          <Tooltip title={'share audience link'}>
            <CopyToClipboard className={clsx(classes.customBtn, 'share-link')} onCopy={() => {
              mutationCtx.toastSuccess('Copy Success')
            }} text={window.location.toString().replace(/\w+$/, 'audience')}>
              <span></span>
            </CopyToClipboard>
          </Tooltip>
        </div>}
      </div> : null }
      <div className="flex-container">
        <div className="grid-layout position-related">
          {placeholders.map((_, index) => (
            <StreamPlayer
              style={{ gridArea: calcGridArea(index) }}
              className={'stream-profile'}
              showProfile={stateCtx.profile}
              local={false}
              key={index}
              stream={null}
              uid={null}
              showUid={false}
            >
            </StreamPlayer>
          ))}
        </div>
        <div className="grid-layout z-index-5">
          {stateCtx.currentStream
            ? <StreamPlayer
              key={stateCtx.currentStream.getId()}
              main={true}
              showProfile={stateCtx.profile}
              local={config.host && stateCtx.currentStream ? stateCtx.currentStream.getId() === localStream.getId() : false}
              stream={stateCtx.currentStream}
              onDoubleClick={handleDoubleClick}
              uid={stateCtx.currentStream.getId()}
              showUid={true}
              domId={`stream-player-${stateCtx.currentStream.getId()}`}>
            </StreamPlayer>
            : <StreamPlayer
              main={true}
              showProfile={stateCtx.profile}
              local={false}
              stream={null}
              onDoubleClick={handleDoubleClick}
              uid={0}
              showUid={true}
              domId={'default'}>
            </StreamPlayer>
          }
          {otherStreams.map((stream, index) => (<StreamPlayer
            style={{ gridArea: calcGridArea(index) }}
            className={'stream-profile'}
            showProfile={stateCtx.profile}
            local={config.host ? stream.getId() === localStream.getId() : false}
            key={index + '' + stream.getId()}
            stream={stream}
            uid={stream.getId()}
            domId={`stream-player-${stream.getId()}`}
            onDoubleClick={handleDoubleClick}
            showUid={true}
          >
          </StreamPlayer>
          ))}
        </div>
      </div>
    </div>
  </div>) : null
}

export default MeetingPage
