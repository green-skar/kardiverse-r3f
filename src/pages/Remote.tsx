import React from 'react'
import api from '../config/api'

export default function Remote() {
    const send = () => {
        const bc = new BroadcastChannel('kardi-cue')
        bc.postMessage('cue')

        // Log the remote action
        api.triggerAvatarAction('greet', 'remote', { timestamp: Date.now() })
            .catch((error) => {
                // Silently handle API errors - backend might not be running
            });
    }

    return (
        <div className="app-stage">
            <div style={{ textAlign: 'center' }}>
                <h3>Remote</h3>
                <button className="button" onClick={send}>
                    Send Cue
                </button>
            </div>
        </div>
    )
}
