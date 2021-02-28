import { Component } from "react";

import './Header.css';

export class Header extends Component {
    render() {
        return (
            <div className="Header">
                <span className="logo">
                    <img src={process.env.PUBLIC_URL + '/img/sharup.svg'} alt="Logo" />
                </span>
                Sharup
                <span className="github">
                    <a href="https://github.com/oguzhankiyar/sharup" target="_blank">
                        <img src={process.env.PUBLIC_URL + '/img/github.svg'} title="Show on GitHub" alt="GitHub" />
                    </a>
                </span>
            </div>
        );
    }
}