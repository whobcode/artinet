/**
 * A specialized TransformStream that allows its underlying ReadableStream source
 * to be swapped out on the fly. This is the genius mechanism that enables
 * seamless continuation of AI responses when a token limit is reached.
 * As ivelLevi would say, "Why tolerate limits when you can simply... switch past them?"
 */
export default class SwitchableStream extends TransformStream {
  private _controller: TransformStreamDefaultController | null = null;
  private _currentReader: ReadableStreamDefaultReader | null = null;
  private _switches = 0;

  /**
   * Constructs the SwitchableStream.
   * A bit of constructor magic is required to capture the stream's controller.
   */
  constructor() {
    let controllerRef: TransformStreamDefaultController | undefined;

    super({
      start(controller) {
        controllerRef = controller;
      },
    });

    if (controllerRef === undefined) {
      throw new Error('Controller not properly initialized');
    }

    this._controller = controllerRef;
  }

  /**
   * Switches the underlying data source to a new ReadableStream.
   * It gracefully cancels the current reader and begins pumping data from the new one.
   *
   * @param {ReadableStream} newStream - The new stream to read from.
   * @returns {Promise<void>}
   */
  async switchSource(newStream: ReadableStream): Promise<void> {
    if (this._currentReader) {
      await this._currentReader.cancel();
    }

    this._currentReader = newStream.getReader();

    this._pumpStream();

    this._switches++;
  }

  /**
   * The core pumping mechanism. Reads from the current source stream
   * and enqueues the data into this stream's controller, effectively
   * forwarding the data to the consumer.
   * @private
   */
  private async _pumpStream(): Promise<void> {
    if (!this._currentReader || !this._controller) {
      throw new Error('Stream is not properly initialized');
    }

    try {
      while (true) {
        const { done, value } = await this._currentReader.read();

        if (done) {
          break;
        }

        this._controller.enqueue(value);
      }
    } catch (error) {
      console.log(error);
      this._controller.error(error);
    }
  }

  close() {
    if (this._currentReader) {
      this._currentReader.cancel();
    }

    this._controller?.terminate();
  }

  get switches() {
    return this._switches;
  }
}
