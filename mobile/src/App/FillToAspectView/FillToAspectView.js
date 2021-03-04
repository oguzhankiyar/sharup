import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

export class FillToAspectView extends Component {

  static defaultProps = { ratio: '4:3' };
  state = { layoutInfo: null };

  handleLayout = ({ nativeEvent: { layout } }) => {
    const { width, height } = layout;
    this.setState({
      layoutInfo: { width, height },
    });
  };

  getRatio = () => {
    const { ratio } = this.props;
    const [ratioWidth, ratioHeight] = ratio.split(':').map(x => Number(x));
    return ratioHeight / ratioWidth;
  };

  render() {
    const { layoutInfo } = this.state;

    if (!layoutInfo) {
      return <View key="pre-info" onLayout={this.handleLayout} style={styles.containerStyle} />;
    }

    const { height, width } = layoutInfo;
    let wrapperWidth;
    let wrapperHeight;
    
    const ratio = this.getRatio();
    if (ratio * height < width) {
      wrapperHeight = width / ratio;
      wrapperWidth = width;
    } else {
      wrapperWidth = ratio * height;
      wrapperHeight = height;
    }

    const wrapperPaddingX = (width - wrapperWidth) / 2;
    const wrapperPaddingY = (height - wrapperHeight) / 2;

    return (
      <View onLayout={this.handleLayout} style={{...this.props.style, ...styles.containerStyle}}>
        <View
          style={{
            width: wrapperWidth,
            height: wrapperHeight,
            marginLeft: wrapperPaddingX,
            marginTop: wrapperPaddingY,
          }}
        >
          {this.props.children}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative'
  }
});