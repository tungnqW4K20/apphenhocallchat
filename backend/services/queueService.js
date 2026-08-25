/**
 * In-Memory Message Queue Service
 * Handles asynchronous job processing for billing settlements, deposit notifications,
 * audit logging, and background system tasks with concurrency control & retry logic.
 */

class MessageQueueService {
  constructor() {
    this.queues = new Map(); // queueName -> Array of jobs
    this.handlers = new Map(); // queueName -> handler function
    this.isProcessing = new Map(); // queueName -> boolean
    this.stats = {
      processedJobs: 0,
      failedJobs: 0,
      activeQueues: 0
    };

    // Initialize standard system queues
    this.registerQueue('call_billing');
    this.registerQueue('deposit_notifications');
    this.registerQueue('audit_logs');
    this.registerQueue('checkin_rewards');
    this.registerQueue('location_indexing');
  }

  /**
   * Register a new queue with default worker
   */
  registerQueue(queueName, handler = null) {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      this.isProcessing.set(queueName, false);
      if (handler) {
        this.handlers.set(queueName, handler);
      }
    }
  }

  /**
   * Set worker handler for a queue
   */
  process(queueName, handler) {
    this.handlers.set(queueName, handler);
    this._triggerProcess(queueName);
  }

  /**
   * Push a job into a queue
   */
  async add(queueName, data, options = {}) {
    if (!this.queues.has(queueName)) {
      this.registerQueue(queueName);
    }

    const job = {
      id: `${queueName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: new Date().toISOString(),
      priority: options.priority || 'normal' // 'high' | 'normal' | 'low'
    };

    if (options.priority === 'high') {
      this.queues.get(queueName).unshift(job);
    } else {
      this.queues.get(queueName).push(job);
    }

    // Trigger queue processing asynchronously
    setImmediate(() => this._triggerProcess(queueName));
    return job.id;
  }

  /**
   * Internal processor loop
   */
  async _triggerProcess(queueName) {
    if (this.isProcessing.get(queueName)) return;
    const queue = this.queues.get(queueName);
    const handler = this.handlers.get(queueName);

    if (!queue || queue.length === 0 || !handler) return;

    this.isProcessing.set(queueName, true);

    while (queue.length > 0) {
      const job = queue.shift();
      try {
        job.attempts += 1;
        await handler(job.data, job);
        this.stats.processedJobs += 1;
      } catch (err) {
        console.error(`[MessageQueue:${queueName}] Job ${job.id} failed (attempt ${job.attempts}/${job.maxAttempts}):`, err.message);
        if (job.attempts < job.maxAttempts) {
          queue.push(job); // Retry
        } else {
          this.stats.failedJobs += 1;
          console.error(`[MessageQueue:${queueName}] Job ${job.id} permanently discarded.`);
        }
      }
    }

    this.isProcessing.set(queueName, false);
  }

  /**
   * Get queue health stats
   */
  getHealth() {
    const queueLengths = {};
    for (const [name, list] of this.queues.entries()) {
      queueLengths[name] = list.length;
    }
    return {
      status: 'healthy',
      queueLengths,
      ...this.stats
    };
  }
}

const queueService = new MessageQueueService();

// Default Queue Handlers
queueService.process('audit_logs', async (data) => {
  // Async audit log processing
});

module.exports = queueService;
