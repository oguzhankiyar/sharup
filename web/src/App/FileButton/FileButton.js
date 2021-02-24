import { Component, createRef } from 'react';

import './FileButton.css';

export class FileButton extends Component {
    props = { onSelect: (file) => {} };

    inputFile = createRef();

    render = () => {
        return (
            <div>
                <input type="file" ref={this.inputFile} onChange={(event) => this.props.onSelect(event.target.files[0])} style={{ display: 'none' }} />
                <button type="submit" className="add" onClick={() => this.inputFile.current.click()}>Add File</button>
            </div>
        );
    };
}