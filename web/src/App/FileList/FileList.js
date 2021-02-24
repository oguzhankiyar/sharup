import { Component } from "react";

import { FileItem } from './FileItem/FileItem';

import './FileList.css';

export class FileList extends Component {
    props = { items: [], onDownload: (file) => {}, show: false };

    render = () => {
        if (this.props.show === false || !this.props.items) {
            return (<></>);
        }

        return (
            <div className="FileList">
                {
                    this.props.items.length > 0
                        ? this.props.items.map((value, index) => <FileItem value={value} onDownload={file => this.props.onDownload(file)} key={index} />)
                        : <div className="warning">There is no files to show</div>
                }
            </div>
        );
    };
}