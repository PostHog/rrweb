/**
 * @jest-environment jsdom
 */
import { polyfillWebGLGlobals } from '../utils';
polyfillWebGLGlobals();

import { EventType, eventWithTime } from '@rrweb/types';
import { Replayer } from '../../src/replay';
import type { playerConfig } from '../../typings/types';

const event = (): eventWithTime => {
  return {
    timestamp: 1,
    type: EventType.DomContentLoaded,
    data: {},
  };
};

describe('replayer error handler', () => {
  function makeThrowingReplayer(config: Partial<playerConfig>) {
    const errorThrowingStyleMirrorMock = {
      getStyle: () => {
        throw new Error('mock error');
      },
    };

    const replayer = new Replayer(
      // Get around the error "Replayer need at least 2 events."
      [event(), event()],
    );
    (replayer as any).styleMirror = errorThrowingStyleMirrorMock;

    return replayer;
  }

  it('the default is to throw an error', () => {
    const replayer = makeThrowingReplayer({});
    expect(() =>
      replayer['applyIncremental'](
        {
          data: { source: 8, styleId: 'id-presence-causes-mock-to-be-called' },
        } as unknown as any,
        false,
      ),
    ).toThrow('mock error');
  });
  it('can receive an error handler', () => {
    const errorHandler = jest.fn();
    const replayer = makeThrowingReplayer({
      onError: errorHandler,
    });
    expect(() =>
      replayer['applyIncremental'](
        {
          data: { source: 8, styleId: 'id-presence-causes-mock-to-be-called' },
        } as unknown as any,
        false,
      ),
    ).not.toThrow('mock error');
    expect(errorHandler).toHaveBeenCalled();
  });
});
